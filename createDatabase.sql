DROP TABLE IF EXISTS breedvotes;

CREATE TABLE breedvotes (
    id SERIAL PRIMARY KEY,
    dogbreed TEXT NOT NULL,
    vote INTEGER NOT NULL DEFAULT 0,
    time TIMESTAMP DEFAULT now()
);

INSERT INTO breedvotes (dogbreed, vote)
VALUES ('Golden Retriever', 3);

INSERT INTO breedvotes (dogbreed)
VALUES ('Silver Retriever');