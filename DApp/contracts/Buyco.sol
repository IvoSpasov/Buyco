pragma solidity ^0.4.18;

contract Buyco {
    struct User {
        string name;
        string phone;
        string email;
    }

    struct Item {
        uint id;
        string title;
        string description;
        uint priceInWei;
        address sellerAddress;
        bool isSold;
    }

    mapping(address => User) private users;
    Item[] private itemsForSale;

    function addUser(string name) public {
        User memory newUser;
        newUser.name = name;
        users[msg.sender] = newUser;
    }

    function getUser(address addr) public view returns(string) {
        User memory foundUser = users[addr];
        return foundUser.name;
    }

    function addItem(string title, uint priceInEth) public {
        // user must be registered
        require(bytes(users[msg.sender].name).length != 0);
        Item memory newItem;
        newItem.title = title;
        newItem.priceInWei = priceInEth * 1 ether;
        newItem.sellerAddress = msg.sender;
        newItem.isSold = false;
        itemsForSale.push(newItem);
    }

    function getItemsLength() public view returns(uint length) {
        length = itemsForSale.length;
    }

    function getItem(uint itemId) public view returns(string title, uint priceInWei, bool isSold) {
        require(0 <= itemId && itemId < itemsForSale.length);
        Item memory foundItem = itemsForSale[itemId];
        title = foundItem.title;
        priceInWei = foundItem.priceInWei;
        isSold = foundItem.isSold;
    }

    function buyItem(uint itemId) public payable {
        // user must be registered
        require(bytes(users[msg.sender].name).length != 0);
        // item id must be valid
        require(0 <= itemId && itemId < itemsForSale.length);
        // item musn't be sold
        require(!itemsForSale[itemId].isSold);
        // buyer must pay the exact value of the item
        require(itemsForSale[itemId].priceInWei == msg.value);

        itemsForSale[itemId].isSold = true;
        transferFundsToSeller(itemId);
    }

    // deduct 5% from item price and transfer funds to seller
    function transferFundsToSeller(uint soldItemId) private {
        uint totalAmount = itemsForSale[soldItemId].priceInWei;
        uint fivePercentOfTotalAmount = totalAmount * 5 / 100;
        uint deductedAmount = totalAmount - fivePercentOfTotalAmount;
        address sellerAddress = itemsForSale[soldItemId].sellerAddress;
        sellerAddress.transfer(deductedAmount);
    }
}