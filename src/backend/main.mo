import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Float "mo:core/Float";
import List "mo:core/List";
import Char "mo:core/Char";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type RestaurantId = Nat32;
  type MenuItemId = Nat32;
  type CartItemId = Nat32;
  type OrderId = Nat32;

  module Restaurant {
    public func compare(a : Restaurant, b : Restaurant) : Order.Order {
      switch (Text.compare(a.name, b.name)) {
        case (#equal) { Nat32.compare(a.id, b.id) };
        case (order) { order };
      };
    };
  };

  module MenuItem {
    public func compare(a : MenuItem, b : MenuItem) : Order.Order {
      switch (Text.compare(a.name, b.name)) {
        case (#equal) { Nat32.compare(a.id, b.id) };
        case (order) { order };
      };
    };
  };

  public type UserProfile = {
    name : Text;
    role : AppUserRole;
  };

  public type AppUserRole = { #customer; #restaurant_owner };

  type Restaurant = {
    id : RestaurantId;
    name : Text;
    description : Text;
    cuisineType : Text;
    rating : Float;
    deliveryTimeEstimate : Nat;
    imageUrl : Text;
    owner : Principal;
  };

  type MenuItemCategory = { #appetizer; #main; #dessert; #beverage };

  type MenuItem = {
    id : MenuItemId;
    name : Text;
    description : Text;
    price : Float;
    category : MenuItemCategory;
    imageUrl : Text;
    restaurantId : RestaurantId;
    available : Bool;
  };

  type CartItem = {
    id : CartItemId;
    userId : Principal;
    menuItemId : MenuItemId;
    quantity : Nat;
  };

  type OrderStatus = { #pending; #preparing; #ready; #delivered };

  type OrderItem = {
    menuItemId : MenuItemId;
    quantity : Nat;
    price : Float;
  };

  type Order = {
    id : OrderId;
    userId : Principal;
    items : [OrderItem];
    total : Float;
    deliveryAddress : Text;
    status : OrderStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  let restaurants = Map.empty<RestaurantId, Restaurant>();
  let menuItems = Map.empty<MenuItemId, MenuItem>();
  let cartItems = Map.empty<CartItemId, CartItem>();
  let orders = Map.empty<OrderId, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  var nextRestaurantId : RestaurantId = 1;
  var nextMenuItemId : MenuItemId = 1;
  var nextCartItemId : CartItemId = 1;
  var nextOrderId : OrderId = 1;

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User Registration
  public shared ({ caller }) func registerUser(name : Text, role : AppUserRole) : async () {
    // Allow anyone (including guests) to register
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("User already registered");
    };

    let newProfile : UserProfile = { name; role };
    userProfiles.add(caller, newProfile);
  };

  // Restaurant Management
  public shared ({ caller }) func createRestaurant(
    name : Text,
    description : Text,
    cuisineType : Text,
    rating : Float,
    deliveryTimeEstimate : Nat,
    imageUrl : Text,
  ) : async RestaurantId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create restaurants");
    };

    // Verify user is a restaurant owner
    switch (userProfiles.get(caller)) {
      case (null) {
        Runtime.trap("User profile not found. Please register first.");
      };
      case (?profile) {
        switch (profile.role) {
          case (#customer) {
            Runtime.trap("Unauthorized: Only restaurant owners can create restaurants");
          };
          case (#restaurant_owner) {};
        };
      };
    };

    let restaurant : Restaurant = {
      id = nextRestaurantId;
      name;
      description;
      cuisineType;
      rating;
      deliveryTimeEstimate;
      imageUrl;
      owner = caller;
    };

    restaurants.add(nextRestaurantId, restaurant);
    let id = nextRestaurantId;
    nextRestaurantId += 1;
    id;
  };

  public query func listRestaurants() : async [Restaurant] {
    // Public - no authorization needed
    restaurants.values().toArray().sort();
  };

  public query func getRestaurant(id : RestaurantId) : async ?Restaurant {
    // Public - no authorization needed
    restaurants.get(id);
  };

  public query func searchRestaurants(searchTerm : Text) : async [Restaurant] {
    // Public - no authorization needed
    let lowerSearchTerm = searchTerm.toLower();
    restaurants.values()
      .filter(func(r : Restaurant) : Bool {
        r.name.toLower().contains(#text lowerSearchTerm) or
        r.cuisineType.toLower().contains(#text lowerSearchTerm)
      })
      .toArray()
      .sort();
  };

  public shared ({ caller }) func updateRestaurant(
    id : RestaurantId,
    name : Text,
    description : Text,
    cuisineType : Text,
    rating : Float,
    deliveryTimeEstimate : Nat,
    imageUrl : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update restaurants");
    };

    switch (restaurants.get(id)) {
      case (null) {
        Runtime.trap("Restaurant not found");
      };
      case (?restaurant) {
        // Verify caller is the owner
        if (caller != restaurant.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the restaurant owner can update this restaurant");
        };

        let updatedRestaurant : Restaurant = {
          id = restaurant.id;
          name;
          description;
          cuisineType;
          rating;
          deliveryTimeEstimate;
          imageUrl;
          owner = restaurant.owner;
        };
        restaurants.add(id, updatedRestaurant);
      };
    };
  };

  // Menu Item Management
  public shared ({ caller }) func createMenuItem(
    name : Text,
    description : Text,
    price : Float,
    category : MenuItemCategory,
    imageUrl : Text,
    restaurantId : RestaurantId,
  ) : async MenuItemId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create menu items");
    };

    // Verify restaurant exists and caller is the owner
    switch (restaurants.get(restaurantId)) {
      case (null) {
        Runtime.trap("Restaurant not found");
      };
      case (?restaurant) {
        if (caller != restaurant.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the restaurant owner can create menu items");
        };
      };
    };

    let menuItem : MenuItem = {
      id = nextMenuItemId;
      name;
      description;
      price;
      category;
      imageUrl;
      restaurantId;
      available = true;
    };

    menuItems.add(nextMenuItemId, menuItem);
    let id = nextMenuItemId;
    nextMenuItemId += 1;
    id;
  };

  public query func listMenuItems(restaurantId : RestaurantId) : async [MenuItem] {
    // Public - no authorization needed
    menuItems.values()
      .filter(func(item : MenuItem) : Bool { item.restaurantId == restaurantId })
      .toArray()
      .sort();
  };

  public query func getMenuItem(id : MenuItemId) : async ?MenuItem {
    // Public - no authorization needed
    menuItems.get(id);
  };

  public shared ({ caller }) func updateMenuItem(
    id : MenuItemId,
    name : Text,
    description : Text,
    price : Float,
    category : MenuItemCategory,
    imageUrl : Text,
    available : Bool,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update menu items");
    };

    switch (menuItems.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?menuItem) {
        // Verify caller owns the restaurant
        switch (restaurants.get(menuItem.restaurantId)) {
          case (null) {
            Runtime.trap("Restaurant not found");
          };
          case (?restaurant) {
            if (caller != restaurant.owner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the restaurant owner can update menu items");
            };
          };
        };

        let updatedMenuItem : MenuItem = {
          id = menuItem.id;
          name;
          description;
          price;
          category;
          imageUrl;
          restaurantId = menuItem.restaurantId;
          available;
        };
        menuItems.add(id, updatedMenuItem);
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : MenuItemId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete menu items");
    };

    switch (menuItems.get(id)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?menuItem) {
        // Verify caller owns the restaurant
        switch (restaurants.get(menuItem.restaurantId)) {
          case (null) {
            Runtime.trap("Restaurant not found");
          };
          case (?restaurant) {
            if (caller != restaurant.owner and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only the restaurant owner can delete menu items");
            };
          };
        };

        menuItems.remove(id);
      };
    };
  };

  // Cart Management
  public shared ({ caller }) func addToCart(menuItemId : MenuItemId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add items to cart");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    // Verify menu item exists
    switch (menuItems.get(menuItemId)) {
      case (null) {
        Runtime.trap("Menu item not found");
      };
      case (?_) {};
    };

    let cartItem : CartItem = {
      id = nextCartItemId;
      userId = caller;
      menuItemId;
      quantity;
    };

    cartItems.add(nextCartItemId, cartItem);
    nextCartItemId += 1;
  };

  public shared ({ caller }) func updateCartItemQuantity(cartItemId : CartItemId, quantity : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update cart items");
    };

    if (quantity == 0) {
      Runtime.trap("Quantity must be greater than 0");
    };

    switch (cartItems.get(cartItemId)) {
      case (null) {
        Runtime.trap("Cart item not found");
      };
      case (?cartItem) {
        // Verify caller owns this cart item
        if (caller != cartItem.userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own cart items");
        };

        let updatedCartItem : CartItem = {
          cartItem with quantity;
        };
        cartItems.add(cartItemId, updatedCartItem);
      };
    };
  };

  public shared ({ caller }) func removeFromCart(cartItemId : CartItemId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove cart items");
    };

    switch (cartItems.get(cartItemId)) {
      case (null) {
        Runtime.trap("Cart item not found");
      };
      case (?cartItem) {
        // Verify caller owns this cart item
        if (caller != cartItem.userId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only remove your own cart items");
        };

        cartItems.remove(cartItemId);
      };
    };
  };

  public query ({ caller }) func getCart() : async { items : [(CartItem, MenuItem)]; total : Float } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view cart");
    };

    let userCartItems = cartItems.values()
      .filter(func(item : CartItem) : Bool { item.userId == caller })
      .toArray();

    var total : Float = 0.0;
    let itemsWithDetails = userCartItems.map<CartItem, (CartItem, MenuItem)>(
      func(cartItem : CartItem) : (CartItem, MenuItem) {
        switch (menuItems.get(cartItem.menuItemId)) {
          case (null) {
            Runtime.trap("Menu item not found");
          };
          case (?menuItem) {
            total += menuItem.price * Int.abs(cartItem.quantity).toFloat();
            (cartItem, menuItem);
          };
        };
      },
    );

    { items = itemsWithDetails; total };
  };

  // Order Management
  public shared ({ caller }) func placeOrder(deliveryAddress : Text) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    if (deliveryAddress.size() == 0) {
      Runtime.trap("Delivery address is required");
    };

    // Get user's cart items
    let userCartItems = cartItems.values()
      .filter(func(item : CartItem) : Bool { item.userId == caller })
      .toArray();

    if (userCartItems.size() == 0) {
      Runtime.trap("Cart is empty");
    };

    // Build order items and calculate total
    var total : Float = 0.0;
    let orderItems = userCartItems.map(
      func(cartItem : CartItem) : OrderItem {
        switch (menuItems.get(cartItem.menuItemId)) {
          case (null) {
            Runtime.trap("Menu item not found");
          };
          case (?menuItem) {
            let itemTotal = menuItem.price * Int.abs(cartItem.quantity).toFloat();
            total += itemTotal;
            {
              menuItemId = cartItem.menuItemId;
              quantity = cartItem.quantity;
              price = menuItem.price;
            };
          };
        };
      },
    );

    let now = Time.now();
    let order : Order = {
      id = nextOrderId;
      userId = caller;
      items = orderItems;
      total;
      deliveryAddress;
      status = #pending;
      createdAt = now;
      updatedAt = now;
    };

    orders.add(nextOrderId, order);
    let orderId = nextOrderId;
    nextOrderId += 1;

    // Clear user's cart
    for (cartItem in userCartItems.vals()) {
      cartItems.remove(cartItem.id);
    };

    orderId;
  };

  public query ({ caller }) func getOrderHistory() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order history");
    };

    orders.values()
      .filter(func(order : Order) : Bool { order.userId == caller })
      .toArray();
  };

  public query ({ caller }) func getRestaurantOrders(restaurantId : RestaurantId) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view restaurant orders");
    };

    // Verify caller owns the restaurant
    switch (restaurants.get(restaurantId)) {
      case (null) {
        Runtime.trap("Restaurant not found");
      };
      case (?restaurant) {
        if (caller != restaurant.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the restaurant owner can view orders");
        };
      };
    };

    // Get all menu items for this restaurant
    let restaurantMenuItemIds = menuItems.values()
      .filter(func(item : MenuItem) : Bool { item.restaurantId == restaurantId })
      .map(func(item : MenuItem) : MenuItemId { item.id })
      .toArray();

    // Filter orders that contain items from this restaurant
    orders.values()
      .filter(func(order : Order) : Bool {
        order.items.any<OrderItem>(
          func(orderItem : OrderItem) : Bool {
            restaurantMenuItemIds.any<MenuItemId>(
              func(menuItemId : MenuItemId) : Bool {
                orderItem.menuItemId == menuItemId
              },
            )
          },
        )
      })
      .toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) {
        Runtime.trap("Order not found");
      };
      case (?order) {
        // Verify caller owns a restaurant that has items in this order
        var isAuthorized = false;

        for (orderItem in order.items.vals()) {
          switch (menuItems.get(orderItem.menuItemId)) {
            case (null) {};
            case (?menuItem) {
              switch (restaurants.get(menuItem.restaurantId)) {
                case (null) {};
                case (?restaurant) {
                  if (caller == restaurant.owner or AccessControl.isAdmin(accessControlState, caller)) {
                    isAuthorized := true;
                  };
                };
              };
            };
          };
        };

        if (not isAuthorized) {
          Runtime.trap("Unauthorized: Only the restaurant owner can update order status");
        };

        let updatedOrder : Order = {
          order with
          status;
          updatedAt = Time.now();
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };
};
