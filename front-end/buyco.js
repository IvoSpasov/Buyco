$(document).ready(async function () {
    let providers = ethers.providers;
    let provider = new providers.JsonRpcProvider('http://localhost:8545');
    const oneEth = 1000000000000000000;
    const contractAddress = '0x26fac5711798708a032ebebc60859d43b9bb43a6';
    const contractAbi = [
        {
            "inputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "name",
                    "type": "string"
                }
            ],
            "name": "addUser",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "addr",
                    "type": "address"
                }
            ],
            "name": "getUser",
            "outputs": [
                {
                    "name": "",
                    "type": "string"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "title",
                    "type": "string"
                },
                {
                    "name": "priceInEth",
                    "type": "uint256"
                }
            ],
            "name": "addItem",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getItemsLength",
            "outputs": [
                {
                    "name": "length",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [
                {
                    "name": "itemId",
                    "type": "uint256"
                }
            ],
            "name": "getItem",
            "outputs": [
                {
                    "name": "title",
                    "type": "string"
                },
                {
                    "name": "priceInWei",
                    "type": "uint256"
                },
                {
                    "name": "isSold",
                    "type": "bool"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "itemId",
                    "type": "uint256"
                }
            ],
            "name": "buyItem",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": true,
            "inputs": [],
            "name": "getContractBalance",
            "outputs": [
                {
                    "name": "",
                    "type": "uint256"
                }
            ],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "amountInEth",
                    "type": "uint256"
                }
            ],
            "name": "getFundsFromContract",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ];

    function createWallet(privateKey) {
        return new ethers.Wallet('0x' + privateKey);
    }

    function createRandomWallet() {
        return ethers.Wallet.createRandom();
    }

    async function encryptWallet(wallet, walletPassword) {
        return await wallet.encrypt(walletPassword);
    }

    async function decryptWallet(walletJson, walletPassword) {
        return await ethers.Wallet.fromEncryptedWallet(walletJson, walletPassword);
    }

    function saveWalletToStorage(walletJson) {
        localStorage.wallet = walletJson;
    }

    function getWalletFromStorage() {
        return localStorage.wallet;
    }

    async function processNewWallet(walletPassword) {
        let wallet = createRandomWallet();
        let walletJson = await encryptWallet(wallet, walletPassword);
        saveWalletToStorage(walletJson);
        // TODO: add message on screen for success
        // TODO: save to disk
    }

    async function processWalletImport(privateKey, walletPassword) {
        let wallet = createWallet(privateKey);
        let walletJson = await encryptWallet(wallet, walletPassword);
        saveWalletToStorage(walletJson);
        // TODO: add message on screen for success
    }

    async function getContractForWriting(walletPassword) {
        let userWalletJson = getWalletFromStorage();
        let userWallet = await decryptWallet(userWalletJson, walletPassword);
        userWallet.provider = provider;
        let contract = new ethers.Contract(contractAddress, contractAbi, userWallet);
        return contract;
    }

    function getContractForReading() {
        return new ethers.Contract(contractAddress, contractAbi, provider);
    }

    async function getUserFromContract(address) {
        let contract = getContractForReading();
        let result = await contract.getUser(address);
        console.log(result);
        console.log(result[0]);
    }

    async function registerUser(name, walletPassword) {
        let contract = await getContractForWriting(walletPassword);
        let result = await contract.addUser(name); // shoud I await here?
        console.log('Added user: ' + result);
        // TODO: add message on screen for success
    }

    async function addNewItem(title, priceInEth, walletPassword) {
        let contract = await getContractForWriting(walletPassword);
        let result = await contract.addItem(title, priceInEth);
        console.log('Added a new item for sale: ' + result);
        // TODO: add message on screen for success
    }

    async function getItemsForSale() {
        let contract = getContractForReading();
        let itemsLength = await contract.getItemsLength();
        let items = [];
        let item;
        for (let i = 0; i < itemsLength; i++) {
            item = await contract.getItem(i);
            item.id = i;
            //if (!item.isSold) {
                items.push(item);
            //}
        }

        return items;
    }

    async function buyItem(itemId, walletPassword) {
        let contract = await getContractForWriting(walletPassword);
        let item = await contract.getItem(itemId);
        let options = { value: item.priceInWei };
        let result = await contract.buyItem(itemId, options);
        console.log('Item bought ' + result);
    }

    $('#new-wallet').click(() => {
        let password = $('#new-wallet-password').val();
        processNewWallet(password);
        $('#new-wallet-password').val('');
    });

    $('#import-wallet').click(() => {
        let privateKey = $('#private-key').val();
        let password = $('#imported-wallet-password').val();
        processWalletImport(privateKey, password);
        $('#private-key').val('');
        $('#imported-wallet-password').val('');
    });

    $('#register').click(() => {
        let nameOfUser = $('#name').val();
        let walletPassword = $('#register-unlock-password').val();
        registerUser(nameOfUser, walletPassword);
        $('#name').val('');
        $('#register-unlock-password').val('');
    });

    $('#add-item').click(async () => {
        let itemTitle = $('#item-title').val();
        let itemPrice = $('#item-price').val();
        let walletPassword = $('#add-item-unlock-password').val();
        await addNewItem(itemTitle, itemPrice, walletPassword);
        $('#item-title').val('');
        $('#item-price').val('');
        $('#add-item-unlock-password').val('');
        addItemsForSaleToDom();
    });

    async function addItemsForSaleToDom() {
        $('#items').empty();
        let itemsForSale = await getItemsForSale();
        $.each(itemsForSale, (index, item) => {
            let itemPriceInEth = item.priceInWei / oneEth;
            $('#items').append(`<b>Item #${item.id} </b> Title: ${item.title} -> price: ${itemPriceInEth} eth. is sold: ${item.isSold} `);
            $('#items').append(`<input type="button" id="buy-item-${item.id}" class="buy-button" value="Buy" />`);
            $('#items').append(`<br>`);
        });
    }

    addItemsForSaleToDom();

    $('#items').on('click', 'input.buy-button', async function () {
        let buttonId = $(this).attr('id');
        let itemId = buttonId.substring(9);
        let walletPassword = $('#buy-item-unlock-password').val();
        await buyItem(itemId, walletPassword);
        $('#buy-item-unlock-password').val('');
        addItemsForSaleToDom();
    });
});
