mkdir -p Archive1/fold1
mkdir -p Archive1/fold2
mkdir -p Archive1/fold3
openssl rand -base64 8 > Archive1/file1.txt
openssl rand -base64 8 > Archive1/file2.txt
openssl rand -base64 8 > Archive1/file3.txt
openssl rand -base64 8 > Archive1/fold1/file4.txt
openssl rand -base64 8 > Archive1/fold2/file5.txt
openssl rand -base64 8 > Archive1/fold3/file6.txt