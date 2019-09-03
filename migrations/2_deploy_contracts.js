var Election = artifacts.require("Elections");

module.exports = function(deployer) {
  deployer.deploy(Election,  
  "0x2aA09E0528e8520Adf469E378b23527543d0cfc8",
  1567366528,
  86400,
  86400 );
};
