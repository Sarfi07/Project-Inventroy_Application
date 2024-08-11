const { Client } = require("pg");

const SQL = `
CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE subCategory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
);

CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    imgUrl TEXT,
    size TEXT,
    quantity INTEGER,
    brand TEXT,
    color TEXT,
    category_id INT NOT NULL,
    subCategory_id INT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    FOREIGN KEY (subCategory_id) REFERENCES subCategory(id) ON DELETE CASCADE
);

INSERT INTO category (name, description) 
VALUES 
    ('Electronics', 'Devices and gadgets'),
    ('Clothing', 'Apparel and accessories'),
    ('Home Appliances', 'Household machines');

INSERT INTO subCategory (name, description, category_id) 
VALUES 
    ('Smartphones', 'Mobile devices', 1),  
    ('Laptops', 'Portable computers', 1),  
    ('Mens Clothing', 'Apparel for men', 2),  
    ('Womens Clothing', 'Apparel for women', 2),  
    ('Kitchen Appliances', 'Devices for kitchen', 3);  

INSERT INTO item (name, description, price, imgUrl, size, quantity, brand, color, category_id, subCategory_id) 
VALUES 
    ('iPhone 13', 'Latest Apple smartphone', 999, 'http://imageurl.com/iphone13', 'N/A', 50, 'Apple', 'Black', 1, 1), 
    ('MacBook Pro', 'High-performance laptop', 1999, 'http://imageurl.com/macbookpro', '13-inch', 30, 'Apple', 'Space Gray', 1, 2),
    ('Mens Jacket', 'Warm winter jacket', 120, 'http://imageurl.com/mensjacket', 'L', 100, 'North Face', 'Blue', 2, 3), 
    ('Womens Dress', 'Elegant evening dress', 150, 'http://imageurl.com/womensdress', 'M', 80, 'Zara', 'Red', 2, 4), 
    ('Microwave Oven', 'High-efficiency microwave', 300, 'http://imageurl.com/microwave', 'N/A', 20, 'Samsung', 'Silver', 3, 5);

`;

async function main() {
  console.log("seeding...");
  const client = new Client({
    connectionString:
      "postgresql://sarfi07:seraj2005@localhost:5432/project_inventory_application",
  });

  await client.connect();
  await client.query(SQL);
  await client.end();
  console.log("done");
}

main();
