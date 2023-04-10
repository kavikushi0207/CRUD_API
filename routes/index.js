const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');

//just need when using swagger ui.
//const swaggerUi = require("swagger-ui-express");
//const swaggerDocument = require("../swagger.json");

const app = express();
const port = 3001;

app.use(bodyParser.json())
app.use(express.json())

//app.use('/swag-ui', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Initialize Firebase Admin SDK
const serviceAccount = require('../testing-project-37446-firebase-adminsdk-xxpi2-fd662986f4.json');
const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://testing-project-37446-default-rtdb.firebaseio.com/'
});

// Define routes for CRUD operations
const db = admin.database();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// POST method to add a customer with auto-generated ID
app.post('/customers', async (req, res) => {
  try {
    const { name, email } = req.body;
    console.log('request data: ',req.body);
    if (!name || !email ) {
      res.status(400).send('Missing parameters');
      return;
    }
    const ref = db.ref('customers');
    const newCustomerRef = ref.push(); // generate new key
    await newCustomerRef.set({
      name: name,
      email: email
    });
    res.status(201).send(`Customer ${newCustomerRef.key} added successfully.`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// GET method for retrieving all customers
app.get('/customers', async (req, res) => {
  // Get a reference to the customers collection in the database
  const customersRef = db.ref('customers');
// Retrieve all customers from the database
  await customersRef.once('value', (snapshot) => {
    const customers = snapshot.val();
    res.status(201).send(customers);
    //console.log(customers);
  }, (error) => {
    console.error(error);
  });
});

// PUT method to update a customer by ID
async function updateCustomer(id, name, email) {
  try {
    const customerRef = db.ref('/customers/' + id);
    await customerRef.update({name: name, email: email});
    console.log('Customer updated successfully');
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
}
app.put('/customers/:id', async (req, res) => {
  const id = req.params.id;
  const { name, email} = req.body;
  try {
    const updatedCustomer = await updateCustomer(id, name, email); // Call the async method here
    res.send(updatedCustomer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});
// DELETE method to delete a customer by ID
async function deleteCustomer(id) {
  try {
    const customerRef = db.ref('customers/' + id);
    await customerRef.remove();
    console.log('Customer deleted successfully');
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
}
app.delete('/customers/:id',async(req, res)=>{
  const id = req.params.id;
  try{
    const delCustomer = await deleteCustomer(id);
    res.send(delCustomer)
  }catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Log any error messages to the console
app.on("error", (err) => {
  console.error(err);
});

module.exports = router;
