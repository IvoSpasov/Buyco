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
        uint priceInEth;
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
        newItem.priceInEth = priceInEth * 1 ether;
        newItem.sellerAddress = msg.sender;
        newItem.isSold = false;
        itemsForSale.push(newItem);
    }

    function getItems() public view returns(Item[]) {
        return itemsForSale;
    }

    function buyItem(uint itemId) public payable {
        // user must be registered
        require(bytes(users[msg.sender].name).length != 0);
        // item id must be valid
        require(0 <= itemId && itemId < itemsForSale.length);
        // item musn't be sold
        require(!itemsForSale[itemId].isSold);
        // buyer must pay the exact value of the item
        require(itemsForSale[itemId].priceInEth == msg.value);

        itemsForSale[itemId].isSold = true;
        transferFundsToSeller(itemId);
    }

    // deduct 5% from item price and transfer funds to seller
    function transferFundsToSeller(uint soldItemId) private {
        uint totalAmount = itemsForSale[soldItemId].priceInEth;
        uint fivePercentOfTotalAmount = totalAmount * 5 / 100;
        uint deductedAmount = totalAmount - fivePercentOfTotalAmount;
        address sellerAddress = itemsForSale[soldItemId].sellerAddress;
        sellerAddress.transfer(deductedAmount);
    }
}