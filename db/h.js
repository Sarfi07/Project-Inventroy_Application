```

CREATE TABLE category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
)


CREATE TABLE subCategory (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE
    ) 
    
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
    FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
    FOREIGN KEY (subCategory_id) REFERENCES subCategory(id) ON DELETE CASCADE
    )

INSERT INTO category (name, description) 
VALUES 
    ('Electronics', 'Devices and gadgets'),
    ('Clothing', 'Apparel and accessories'),
    ('Home Appliances', 'Household machines');


    INSERT INTO subCategory (name, description, category_id) 
VALUES 
    ('Smartphones', 'Mobile devices', 1),  -- References Electronics (id=1)
    ('Laptops', 'Portable computers', 1),  -- References Electronics (id=1)
    ("Men\'s Clothing", 'Apparel for men', 2),  -- References Clothing (id=2)
    ("Women\'s Clothing", 'Apparel for women', 2),  -- References Clothing (id=2)
    ('Kitchen Appliances', 'Devices for kitchen', 3);  -- References Home Appliances (id=3)

INSERT INTO item (name, description, price, imgUrl, size, quantity, brand, color, category_id, subCategory_id) 
VALUES 
    ('iPhone 13', 'Latest Apple smartphone', 999, 'http://imageurl.com/iphone13', 'N/A', 50, 'Apple', 'Black', 1, 1),  -- Electronics > Smartphones
    ('MacBook Pro', 'High-performance laptop', 1999, 'http://imageurl.com/macbookpro', '13-inch', 30, 'Apple', 'Space Gray', 1, 2),  -- Electronics > Laptops
    ('Men\'s Jacket', 'Warm winter jacket', 120, 'http://imageurl.com/mensjacket', 'L', 100, 'North Face', 'Blue', 2, 3),  -- Clothing > Men\'s Clothing
    ('Women\'s Dress', 'Elegant evening dress', 150, 'http://imageurl.com/womensdress', 'M', 80, 'Zara', 'Red', 2, 4),  -- Clothing > Women\'s Clothing
    ('Microwave Oven', 'High-efficiency microwave', 300, 'http://imageurl.com/microwave', 'N/A', 20, 'Samsung', 'Silver', 3, 5);  -- Home Appliances > Kitchen Appliances


```;
