db = db.getSiblingDB('user_management');
db.createUser({
  user: 'appuser',
  pwd: 'appuser123',
  roles: [{ role: 'readWrite', db: 'user_management' }]
});