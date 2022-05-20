UPDATE breedvotes
SET vote =  $1
WHERE id = $2
RETURNING *;

