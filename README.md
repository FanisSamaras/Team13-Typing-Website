
![image](https://img.shields.io/badge/JSS-F7DF1E?style=for-the-badge&logo=JSS&logoColor=white)
![image](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![image](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![image](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white)


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
    ├── public/ 
    │   ├── css/ #Main CSS file
    │   │   ├── first_page.css
    │   ├── js/
    │   │   ├── main.mjs #JS Frontend file
    ├── server/
    │   ├── config/
    │   │   ├── db.mjs #Database initialization
    │   ├── data/ # Greek/English words and quotes
    │   │   ├── el.json
    │   │   ├── en.json
    │   │   ├── quotes.json
    │   ├── database/
    │   │   ├── database.sqlite #Database
    │   │   ├── schema.sql #Database Schema
    │   ├── routes/
    │   │   ├── Routes.mjs #Backend routing
    │   ├── program.mjs #Backend imports 
    │   ├── server.mjs #Backend Main
    ├── views/ #Pages with handlebars
    │   ├── layouts/
    │   │   └── main.hbs #Header/Footer and inclusions 
    │   ├── first_page.hbs 
    │   ├── leaderboards_page.hbs
    │   ├── login_page.hbs
    │   ├── result_page.hbs
    │   ├── sign_up_page.hbs
    │   └── user_page.hbs
    ├── .env.example #.env example for easy installation
    ├── .gitignore
    ├── package.json #List dependencies / scripts / metadata
    └── README.md 
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
POST /api/quotes/?lang=el

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



