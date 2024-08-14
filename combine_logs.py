mport csv

# Define file paths
access_log_path = '/var/www/html/BotD/access_log.csv'
bot_detections_path = '/var/www/html/BotD/bot_detections.csv'
combined_log_path = '/var/www/html/BotD/combined_log.csv'

# Read bot detections data
bot_detections = []
with open(bot_detections_path, 'r') as bot_file:
    bot_reader = csv.reader(bot_file)
    bot_headers = next(bot_reader, [])  # Read header row
    for row in bot_reader:
        bot_detections.append(row)

# Open the access log and combined log files
with open(access_log_path, 'r') as access_file, open(combined_log_path, 'w', newline='') as combined_file:
    access_reader = csv.reader(access_file)
    access_headers = next(access_reader, [])  # Read header row
    combined_writer = csv.writer(combined_file)
    
    # Write combined header to combined_log.csv
    combined_headers = access_headers + bot_headers  # Combine headers
    combined_writer.writerow(combined_headers)
    
    bot_index = 0  # Index to keep track of bot detections

    for row in access_reader:
        if len(row) > 4:  # Ensure there are enough columns
            
            # Convert row to a single string
            row_str = ','.join(row)
            
            # Find the position of the three-digit numeric status
            status_pos = next((i for i, word in enumerate(row) if word.isdigit() and len(word) == 3), None)

            if status_pos is not None and status_pos > 4:
                # Count the number of commas before the status
                pre_status_str = ','.join(row[:status_pos])
                pre_status_comma_count = pre_status_str.count(',')

                if pre_status_comma_count > 5:
                    # Find the positions of the commas
                    comma_positions = [pos for pos, char in enumerate(row_str) if char == ',']
                    
                    # Calculate the range of commas to replace
                    start_replace_pos = comma_positions[4]
                    end_replace_pos = comma_positions[pre_status_comma_count - 1]
		    # Replace commas with hyphens from the fifth comma to the comma before the one immediately >
                    for pos in range(start_replace_pos, end_replace_pos + 1):
                        if row_str[pos] == ',':
                            row_str = row_str[:pos] + '-' + row_str[pos+1:]
                    
                    # Split the string back into a list
                    row = row_str.split(',')

            if "POST /botdetected/json" in row[4]:
                if bot_index < len(bot_detections):
                    combined_writer.writerow(row + bot_detections[bot_index])
                    bot_index += 1
                else:
                    combined_writer.writerow(row + [''] * len(bot_headers))  # Fill with empty columns if no mo>
            else:
                combined_writer.writerow(row + [''] * len(bot_headers))  # Fill with empty columns
        else:
            combined_writer.writerow(row + [''] * len(bot_headers))  # Fill with empty columns
