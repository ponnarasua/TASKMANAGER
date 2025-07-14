const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
function getDomain(email) {
  return email.split('@')[1].toLowerCase();
}
function isPublicDomain(domain) {
  return publicDomains.includes(domain);
}

module.exports = { getDomain, isPublicDomain };
