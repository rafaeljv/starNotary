const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let tokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, { from: accounts[0] })
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, { from: user2, value: balance });
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance });
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, { from: user1 });
    await instance.putStarUpForSale(starId, starPrice, { from: user1 });
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, { from: user2, value: balance, gasPrice: 0 });
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let starId = 6;
    await instance.createStar('MinhaEstrela', starId, { from: user1 });


    //2. Call the name and symbol properties in your Smart Contract and compare with the name and symbol provided
    let ContractName = await instance.name(); //get Token name
    let ContractSymbol = await instance.symbol(); // get token symbol
    let starLookUp = await instance.lookUptokenIdToStarInfo(starId);

    assert.equal(ContractName, 'Gemini');
    assert.equal(ContractSymbol, 'GMN');
    assert.equal(starLookUp, 'MinhaEstrela');

});

it('lets 2 users exchange stars', async() => {
    let instance = await StarNotary.deployed();
    // two address accounts
    let Alice = accounts[0];
    let Bob = accounts[1];
    // two stars with IDs
    let starId = 7;
    let starId2 = 8;
    // 1. Create 2 Stars
    await instance.createStar('TheMstar', starId, { from: Alice }); // Alice owns star ID 7
    await instance.createStar('TheGstar', starId2, { from: Bob }); // Bob owns star ID 8
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId, starId2);
    let star1 = await instance.ownerOf.call(starId); // get new owner of star ID 7
    let star2 = await instance.ownerOf.call(starId2); // get new owner of star ID 8
    // 3. Verify that the owners changed
    assert.equal(star1, Bob); // Bob should own star ID 7
    assert.equal(star2, Alice); // Alice should own star ID 8

});

it('lets a user transfer a star', async() => {
    let instance = await StarNotary.deployed();
    let Alice = accounts[0];
    let Bob = accounts[1];
    let starId = 9;
    // 1. create a Star
    await instance.createStar('TheMstar', starId, { from: Alice }); // create the star in Alice's account
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(Bob, starId); // Transfer Alices star to Bobs account by star ID 9
    // 3. Verify the star owner changed.
    let stars = await instance.ownerOf.call(starId); // get owner of star ID 9
    assert.equal(stars, Bob); // Bob should own star ID 9
});

it('lookUptokenIdToStarInfo test', async() => {
    let instance = await StarNotary.deployed();
    let Alice = accounts[0];
    let starId = 10;

    // 1. create a Star with different tokenId
    await instance.createStar('Estrela10', starId, { from: Alice }); // create the star in Alice's account
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(starId);
    // 3. Verify if you Star name is the same
    assert.equal(starName, 'Estrela10');
});