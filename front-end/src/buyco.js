$(document).ready(async function () {
    let providers = ethers.providers;
    let provider = new providers.JsonRpcProvider('http://localhost:8545');
    const oneEth = 1000000000000000000;
    const contractAddress = '0xfb99fba92a471dfaf27321a579dc38bfa3ada0a7';
    const contractAbi = [
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
                    "name": "priceInEth",
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
        for (let i = 0; i < itemsLength; i++) {
            items.push(await contract.getItem(i));
        }

        return items;
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

    $('#add-item').click(() => {
        let itemTitle = $('#item-title').val();
        let itemPrice = $('#item-price').val();
        let walletPassword = $('#add-item-unlock-password').val();
        addNewItem(itemTitle, itemPrice, walletPassword);
        $('#item-title').val('');
        $('#item-price').val('');
        $('#add-item-unlock-password').val('');
    });

    function addItemsForSaleToDom(itemsForSale) {
        $.each(itemsForSale, (index, item) => {
            let itemPriceInEth = item.priceInEth / oneEth;
            $('#items').append('<p><b>Item #' + index + '</b> Title: ' + item.title + ' -> price: ' + itemPriceInEth + ' eth.</p>');
        });
    }

    addItemsForSaleToDom(await getItemsForSale());
});
