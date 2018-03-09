$(document).ready(async function () {
    alertify.set('notifier', 'position', 'top-right');
    const alertWaitInSec = 5;

    let providers = ethers.providers;
    let network = providers.networks.ropsten;
    let provider = new providers.JsonRpcProvider('http://localhost:8545');
    //let provider = new providers.EtherscanProvider(network)
    const oneEth = 1000000000000000000;
    const contractAddress = '0x8d0423cf0adf1d68bfdd879b0e72f74f0639e574';
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
        success('New wallet successfully created and encrypted.');
        // TODO: save to disk
        return wallet;
    }

    async function processWalletImport(privateKey, walletPassword) {
        let wallet = createWallet(privateKey);
        let walletJson = await encryptWallet(wallet, walletPassword);
        saveWalletToStorage(walletJson);
        success('Wallet successfully imported.');
        getCurrentUserFromContract();
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

    async function registerUser(name, walletPassword) {
        let contract = await getContractForWriting(walletPassword);
        let transaction = await contract.addUser(name);
        console.log('Transaction for adding user: ' + JSON.stringify(transaction));
        success('Transaction sucessfully sent.');
    }

    async function getCurrentUserFromContract() {
        if (!localStorage.wallet) {
            return;
        }
        let address = JSON.parse(localStorage.wallet).address;
        let contract = getContractForReading();
        let userNameArr = await contract.getUser(address);
        let userName = userNameArr[0];
        if (userName) {
            success('Hello ' + userName);
        }
    }

    getCurrentUserFromContract();

    async function addNewItem(title, priceInEth, walletPassword) {
        let contract = await getContractForWriting(walletPassword);
        let transaction = await contract.addItem(title, priceInEth);
        console.log('Transaction for adding new item: ' + JSON.stringify(transaction));
        success('Transaction sucessfully sent.');
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
        let transaction = await contract.buyItem(itemId, options);
        console.log('Transaction for buying an item: ' + JSON.stringify(transaction));
        success('Transaction sucessfully sent.');
    }

    function success(message) {
        alertify.notify(message, 'success', alertWaitInSec);
    }

    function error(message) {
        alertify.notify(message, 'error', alertWaitInSec);
    }

    $('#new-wallet').click(async () => {
        let password = $('#new-wallet-password').val();
        if (!password) {
            error('Please provide a password.');
            return;
        }

        let wallet = await processNewWallet(password);
        $('#new-wallet-password').val('');
        $('#wallet-info').val(JSON.stringify(wallet, null, '\t'));
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
        $('#table-body').empty();
        let itemsForSale = await getItemsForSale();
        $.each(itemsForSale, (index, item) => {
            let itemPriceInEth = item.priceInWei / oneEth;
            $('#table-body').append(`
                <tr>
                    <th scope="row">${item.id + 1}</th>
                    <td>${item.title}</td>
                    <td>${itemPriceInEth} eth.</td>
                    <td>${item.isSold}</td>
                    <td><input type="button" id="buy-item-${item.id}" class="buy-button btn btn-success btn-sm" value="Buy" /></td>
                </tr>
            `);
        });
    }

    addItemsForSaleToDom();

    $('.table').on('click', 'input.buy-button', async function () {
        let buttonId = $(this).attr('id');
        let itemId = buttonId.substring(9);
        let walletPassword = $('#buy-item-unlock-password').val();
        await buyItem(itemId, walletPassword);
        $('#buy-item-unlock-password').val('');
        addItemsForSaleToDom();
    });
});
