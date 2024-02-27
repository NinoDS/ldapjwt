const ldap = require('ldapjs');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3006;

const client = ldap.createClient({
	url: ['ldap://10.16.1.1:389']
});

client.on('connectError', (err) => {
	console.error(err);
})

function ldapBind(uid, pw) {
	return new Promise((resolve, reject) => {
		client.bind(`uid=${uid},ou=users,dc=schule,dc=local`, pw, (err) => {
			if (err) {
				reject(err);
			} else {
				resolve();
			}
		});
	});
}

app.post('/login', async (req, res) => {
	const { username, password } = req.body;
	try {
		await ldapBind(username, password);
		const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
		res.json({ token });
	} catch (err) {
		res.status(401).json({ message: 'Invalid credentials' });
	}
});

app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});