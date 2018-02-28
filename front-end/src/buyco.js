$(document).ready(async function () {
    let providers = ethers.providers;
    let provider = new providers.JsonRpcProvider('http://localhost:8545');
    let contractAddress = '0x28a1951006b509f6d07a3f5d0646b9e536c22e33';
    let contractAbi = [
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

    function createRandomWallet() {
        return ethers.Wallet.createRandom();
    }

    async function encryptWallet(wallet, walletPassword) {
        return await wallet.encrypt(walletPassword);
    }

    async function decryptWallet(walletJson, walletPassword) {
        return await ethers.Wallet.fromEncryptedWallet(walletJson, walletPassword);
    }

    function saveWallet(walletJson) {
        localStorage.wallet = walletJson;
    }

    async function addUserToContract(name, wallet) {
        wallet.provider = provider;
        let contract = new ethers.Contract(contractAddress, contractAbi, wallet);
        let result = await contract.addUser(name, wallet.address);
        console.log('Added user: ' + result);
    }

    async function getUserFromContract(address) {
        let contract = new ethers.Contract(contractAddress, contractAbi, provider);
        var result = await contract.getUser(address);
        console.log('got user');
        console.log(result);
        console.log(result[0]);
    }

    async function registerUser(name, walletPassword) {
        let wallet = createRandomWallet();
        let walletJson = await encryptWallet(wallet, walletPassword);

        saveWallet(walletJson);

        // who is going to pay? wallet must have non zero balance. Use owners wallet?
        await addUserToContract(name, wallet);
        //await getUserFromContract(wallet.address);
    }

    //await registerUser('Ivo', 'pass');
});
