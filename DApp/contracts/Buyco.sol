pragma solidity ^0.4.18;

contract Buyco {
    struct User {
        string name;
        string email;
        string phone;
        string password; // hash password        
    }

    struct Item {
        uint id;
        string title;
        string description;
        uint price;
        address sellerAddress;
        bool isSold;
    }

    mapping(address => User) private users;
    mapping(uint => Item) private itemsForSale;
    uint private itemId = 0;

    function addUser(string name, address addr) public {
        User newUser;
        newUser.name = name;

        // what if user exist already?
        users[addr] = newUser;
    }

    function getUser(address addr) public returns(string) {
        User foundUser = users[addr];
        // if not found?
        return foundUser.name;
    }

    function addItem(string title, address sellerAddress) public {
        Item newItem;
        newItem.title = title;
        newItem.sellerAddress = sellerAddress;
        newItem.isSold = false;

        itemsForSale[itemId++] = newItem;
    }

    function buyItem(uint id, address buyer) public payable {
        // id is mandatory and check for valid id

        // The buyer must pay the exact value of the item
        require(itemsForSale[id].price == msg.value);

        itemsForSale[id].isSold = true; // if ture -> hide from ui
        transferFundsToSeller(id);
    }

    function transferFundsToSeller(uint soldItemId) {
        address sellerAddress = itemsForSale[soldItemId].sellerAddress;
        // deduct 5% from price and transfer amount to seller
    }
}