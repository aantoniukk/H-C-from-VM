# Hester And Cook migrations app

## Folders structure and description

- *logs/* folder contains log files for daily imports. Every day creates new log file with import logs. To update them enter Virtual Mashine console in Azure, stop the server, commit and push all new files; You will be able to see them in GitHub repository or pull updates to local mashine;

- *config.js* contains TrackVia API credentials;

- *createLinks.js* contains functionality to force links updates in TrackVia. For more details cooperate with Taras Gonchar and don't be change it depending on your needs;

- *functions.js* contains functionality to update TrackVia tables;

- *index.js* runs CRON JOB, which start daily imports;

- *migrations.js* contains script for biger data migration (in case more data need to be imported);

## Usage

### Daily loads
To start daily update on Virtual Mashine enter Azure Hester&Cook VM and run in console:
```
cd hesterandcook
npm run daily
```

If you need to view logs from previous updates, make sure no process is currently running (the last log you see is **"CRON JOB ENDED"**), kill the process (press Ctrl+C) and push all changed files:
```
git add .
git commit -m "get logs"
git push
```

after that renew the process by running the comand
```
npm run daily
```
and look for the logs on GitHub repository.

### Big migrations
If ther is a nned to make biger migration (for example: update all records for last week, etc), enter the *migrations.js* file, make all the changes to script you need and run:

```
npm run migration
```

You can do it on your local mashine (if process doesn't take long) or pull code to Viretual Mashine on Azure (by running *git pull* command in console of Azure Hester&Cook VM).

### Create Links for TrackVia tables
The logic for that is simple: the script, which creates a link in TrackVia runs after rhe record in updated. So all you need to do is get all records without links and update some field in that record.

For more details consult with Taras Gonchar, and he will provide right view ids and field names that need to be changed.

All the the functionality for that sould be written in *createLinks.js* file and to run it use:

```
npm run links
```

**!!! DON'T FORGET TO CHECK IF NODE.JD IS INSTALLED ON YOUR MASHINE AND RUN *npm install* COMMAND BEFORE EXECUTING ANY CODE !!!**