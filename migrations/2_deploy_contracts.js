var Election = artifacts.require("Elections");

module.exports = function(deployer) {
  deployer.deploy(Election,  
  "0x8353381c0497bbbA235400E218fA492Ffa502336",
  1564846240,
  86400,
  86400 );
};
