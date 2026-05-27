
![image](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![image](https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E) 
![image](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![image](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white)
![image](https://img.shields.io/badge/Handlebars%20js-f0772b?style=for-the-badge&logo=handlebarsdotjs&logoColor=black)
![image](https://img.shields.io/badge/Sqlite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)


# Team13 Typing Website #

## Installation guide ##

### Prerequisites ###
<!-- 
- <a target="_black" href = "https://nodejs.org">Node js</a> 24+ 
- <a target="_black" href = "https://git-scm.com/">git</a>  -->

[nodejs](https://nodejs.org) 24+

[git](https://git-scm.com)

### Setting up the website ###

1. Cloning the repository

``` bash
git clone https://github.com/FanisSamaras/Team13-Typing-Website
```

2. Installing the dependencies

``` bash
cd .\Team13-Typing-Website\ && npm install
```

3. Setting up the environment

``` bash
cp .env.example .env
```

Update the `.env` with your config:

- Session Secret

4. Development

``` bash
npm run dev
```

5. Production Build

``` bash
npm start 
```

Now the website should be available at [localhost:3000](https://localhost:3000)

## Repository Structure ##
```bash
Team13-Typing-Website/
├── .env.example #.env example for easy installation
├── .gitignore
├── README.md
├── package-lock.json
├── package.json #List dependencies / scripts / metadata
├── public/
│   ├── css/ #Main CSS file
│   │   └── first_page.css
│   └── js/ #JS Frontend 
│       ├── accuracy.mjs #Accuracy calculator
│       ├── api.mjs #API requests/responses
│       ├── config.mjs #Global variables for the website
│       ├── display.mjs #Dynamic changes in display
│       ├── game.mjs #Game Logic
│       ├── input.mjs #Input handling
│       ├── main.mjs #Main file that get's imported
│       ├── state.mjs #Changes in the game state
│       └── utils.mjs #Function wraps for cleaner code 
├── server/
│   ├── config/ 
│   │   ├── apiCache.mjs #Preloading data
│   │   ├── constants.mjs #General constants
│   │   └── db.mjs #Database initialization
│   ├── data/ # Greek/English words and quotes
│   │   ├── el.json
│   │   ├── en.json
│   │   ├── quotes_el.json
│   │   └── quotes_en.json
│   ├── database/
│   │   ├── database.sqlite #Database
│   │   └── schema.sql #Database schema
│   ├── routes/ #Backend routing
│   │   ├── Routes.mjs
│   │   ├── authRoutes.mjs
│   │   ├── gameRoutes.mjs
│   │   └── leaderboardRoutes.mjs
│   ├── program.mjs #Backend imports 
│   └── server.mjs #Backend Main
└── views/
    ├── error.hbs
    ├── first_page.hbs
    ├── layouts/ #Pages with handlebars
    │   └── main.hbs #Header/Footer and inclusions 
    ├── leaderboards_page.hbs
    ├── login_page.hbs
    ├── result_page.hbs
    ├── sign_up_page.hbs
    └── user_page.hbs
```

## Architecture overview ##

###  Frontend ###

- Build with Javascript + Handlebars + Bootstrap + CSS
- Connects to SQLite local database for user registration and score submission

### Backend ###

- Build with Node.js + Express
- Handless authentication, API requests, and database accessing 

### SQLite Tables ###

|Table | Purpose|
|:-----|:------|
|users|Stores user accounts|
|scores|Saves the scores and the necessary info

## Example API Endpoints ##

### Auth Routes ###

|Endpoint|Method|Description|
|--|--|--|
|/api/signup|POST|Register new user|
|/api/login|POST|Log in user|

### Loading Routes ###
 
|Endpoint|Method|Parameters|Description|
|--|--|--|--|
|/api/quotes/?lang={param}|GET|:lang|Returns quotes for the language|
|/api/words?lang={param}|GET|:lang|Returns words for the language|


### Example Request ###

``` bash 
GET /api/quotes/?lang=el

```

### Example Response ###

``` bash
{
  "language": "greek",
  "quotes": [
    {
      "text": "Να αγαπάς την ευθύνη. Να λες: εγώ, εγώ μονάχος μου έχω χρέος να σώσω τη γη.",
      "source": "Ασκητική",
      "author": "Νίκος Καζαντζάκης",
      "id": 1,
      "length": 83
    },
    {
      "text": "Όπου και να ταξιδέψω η Ελλάδα με πληγώνει.",
      "source": "Μυθιστόρημα",
      "author": "Γιώργος Σεφέρης",
      "id": 2,
      "length": 45
    },
    {
      "text": "Τη γλώσσα μου έδωσαν ελληνική.",
      "source": "Άξιον Εστί",
      "author": "Οδυσσέας Ελύτης",
      "id": 3,
      "length": 33
    },
    ...
  ]
}
```

## Environment Variables ##

|Variable|Description|
|--|--|
|Port|Backend port(default:3000)|
|Session Secret|Encryption key|
|Session Max Age|Duration of the user log in|



