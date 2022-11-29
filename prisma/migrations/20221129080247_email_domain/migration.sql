CREATE EXTENSION citext;


CREATE DOMAIN domain_email AS citext CHECK( VALUE ~ '^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$');