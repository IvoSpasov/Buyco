$(document).ready(async function () {
    let providers = ethers.providers;
    let provider = new providers.JsonRpcProvider('http://localhost:8545');
    const contractAddress = '0x28a1951006b509f6d07a3f5d0646b9e536c22e33';
    const contractAbi = [
        {
            "constant": false,
            "inputs": [
                {
                    "name": "name",
                    "type": "string"
                },
                {
                    "name": "addr",
                    "type": "address"
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
                    "name": "sellerAddress",
                    "type": "address"
                }
            ],
            "name": "addItem",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "name": "buyer",
                    "type": "address"
                }
            ],
            "name": "buyItem",
            "outputs": [],
            "payable": true,
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "constant": false,
            "inputs": [
                {
                    "name": "soldItemId",
                    "type": "uint256"
                }
            ],
            "name": "transferFundsToSeller",
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

    async function addUserToContract(name, wallet) {
        wallet.provider = provider;
        let contract = new ethers.Contract(contractAddress, contractAbi, wallet);
        let result = await contract.addUser(name, wallet.address);
        console.log('Added user: ' + result);
    }

    async function getUserFromContract(address) {
        let contract = new ethers.Contract(contractAddress, contractAbi, provider);
        let result = await contract.getUser(address);
        console.log(result);
        console.log(result[0]);
    }

    async function registerUser(name, walletPassword) {
        let userWalletJson = getWalletFromStorage();
        let userWallet = await decryptWallet(userWalletJson, walletPassword);
        await addUserToContract(name, userWallet);
        // TODO: add message on screen for success
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
});
