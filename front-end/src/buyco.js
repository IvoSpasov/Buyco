(function () {
    let providers = ethers.providers;
    let provider = new providers.JsonRpcProvider('http://localhost:8545');
    let contractAddress = '0x55eafb1eaf9ba02b00fb86ed298b86e8ad5cabe2';
    let abi = [
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

    let privateKey = '0x11d5a5856b9cb05900162c13a49b0d53cdeb9511ed5ed1bc18311b4b20e62cc7';
    let wallet = new ethers.Wallet(privateKey, provider);
    //let contract = new ethers.Contract(contractAddress, abi, wallet);
    //console.log(contract);

    // contract.addUser('Ivo', '0xcd590bd6acba4d20941ff5e321b421be7d25e4ba').then(function (result){
    //     console.log(result);
    // }); 

    let contract = new ethers.Contract(contractAddress, abi, provider);
    contract.getUser('0xcd590bd6acba4d20941ff5e321b421be7d25e4ba').then(function (result) {
        console.log(result[0]);
        console.log(result);
    });
})();


