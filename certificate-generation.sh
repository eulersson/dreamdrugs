# https://www.digitalocean.com/community/tutorials/how-to-create-a-self-signed-ssl-certificate-for-nginx-in-ubuntu-16-04
# https://stackoverflow.com/a/44047595/2649699
apk update && apk add --no-cache openssl
openssl genrsa -des3 -passout pass:abcabc -out /etc/ssl/private/selfsigned.pass.key 2048
openssl rsa -passin pass:abcabc -in /etc/ssl/private/selfsigned.pass.key -out /etc/ssl/private/selfsigned.key
rm /etc/ssl/private/selfsigned.pass.key
openssl req -new -key /etc/ssl/private/selfsigned.key -out /etc/ssl/selfsigned.csr -subj "/C=ES/ST=Barcelona/L=Barcelona/O=dreamdrugs/OU=IT Department/CN=dreamdrugs"
openssl x509 -req -days 365 -in /etc/ssl/selfsigned.csr -signkey /etc/ssl/private/selfsigned.key -out /etc/ssl/certs/selfsigned.crt
