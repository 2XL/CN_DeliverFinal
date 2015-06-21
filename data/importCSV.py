import MySQLdb
import csv

mydb = MySQLdb.connect(host='localhost',
		       user='root',
		       passwd='root',
		       db='cn')
cursor = mydb.cursor()

 
data_source = [
    "ahorapodemos",
    "ciu",
    "compromis",
    "ForoAsturias",
    "iunida",
    "omnium",
    "PSOE",
    "viacatalana",
    "CiudadanosCs",
    "coalicion",
    "cupnacional",
    "geroabai",
    "obloque",
    "PPopular",
    "UPyD"
];

for item in data_source:
    csv_data = csv.reader(file(item +'_tweets.csv'))
    rows = csv_data.next() # skip the first row
    print "load "+item
    for row in csv_data: 
	row.insert(len(row),item) 
	cursor.execute('INSERT INTO tweets(id, created_at, text, entity) VALUES (%s, %s, %s, %s)', row)
    #close the connection to the database.
    mydb.commit()
    
cursor.close()

print "Done"