# Code Golf Runner

A website for running the TechOlympics 2021 code golf competition. Golfers submit their answers as links to code on `https://tio.run/`. Admins can create questions and choose when to show each question, as well as when to stop accepting responses. When someone submits a link, the "crawler," which you can run on your local computer, uses Selenium to visit the link in a headless Chrome instance and input test cases.

## Basic Structure

This website is made up of 3 parts.

- The **client** code that runs in the browser (currently served by Netlify). Responsible for displaying the UI to golfers and admins. Source code is in the `client` directory.
- The **server** (currently run on Heroku). Responsible for syncing the client and crawler with the database (MongoDB). Source code is in the `server-src` directory. The configuration files for the server, like `package.json` and `yarn.lock`, are in the root directory of this repo.
- The **crawler**. Runs on a local computer. Responsible for going to `https://tio.run/` and running the links that people submit to check if the answers are correct. Source code is in the `crawler` directory.

## Running locally for development

1.  Set up a free MongoDB database. The database name doesn't matter. Get the MongoDB connection URL, which will probably start with `mongodb+srv://` (you'll need this in step 2).
2.  Set up environment variables. To do this, you need to create 2 files.

    1. **`.env` (in root directory)**: This should look like

    ```
    MONGO_URI=your mongodb connection url (see step 1)
    PASSWORD=mysecretpassword (this doesn't really matter yet since you're just testing)
    ```

    2. **`.env.development` (in `crawler` directory)**: This should look like

    ```
    PASSWORD=the same password you used in .env
    ```

3.  Install [Yarn v1](https://classic.yarnpkg.com/en/docs/install) if you haven't.
4.  Install dependencies using terminal commands
    1. Run `yarn` in the root directory
    2. Run `yarn` in the `client` directory
    3. Run `yarn` in the `crawler` directory
5.  To start running it, run each of the following commands in a separate terminal window:
    1. Run `yarn dev` in the root directory
    2. Run `yarn dev` in the `client` directory
    3. Run `yarn dev` in the `crawler` directory. You will need to [install ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/) first. (The website will work without the crawler, so feel free to move onto step 6 before doing this step.)
6.  You're done!
    1. To see the golfer page, go to <http://localhost:5000>
    2. To see the admin page, go to <http://localhost:5000/admin#mysecretpassword> (replace `mysecretpassword` with whatever you put in the `.env` files).
    3. If you change any of the code, it will rerun automatically.

## Admin tools

To run the admin textual tools (which allow you to do stuff like renaming players), run `yarn admin-tools`.

## MongoDB backups

```bash
# go to the mongo-backup directory
cd mongo-backup
# back up the database into a folder named after the current date/time
./backup.sh
# back up the database once every 15 seconds (30 seconds is the default if you don't put a number)
./backup-loop.sh
# show the list of backups that have been made
ls
# restore the backup with the specified folder name into the database (make sure to backup the current version database before doing this)
./restore.sh 2022-02-01T12:34:56
```

## Running in production

TODO. (If you want to do this and I haven't finished this section yet, please ask me.)
