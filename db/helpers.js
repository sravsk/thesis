const db = require('./index.js');
const assoc = require('./associations.js');
const Company = require('./Models/Company');
const User = require('./Models/User');
const Category = require('./Models/Category');
const Article = require('./Models/Article');

const bcrypt = require('bcrypt');



// This creates the tables in the database and their relationships.
assoc();

var dbHelpers = {

  /////////////////////
  //      USERS      //
  /////////////////////

  // creating a new user
  // check if a user exists for the given company, if yes, return false in callback
  // if no user exists for the given company, create a user with role 'admin', return true in callback
  addUser: ({name, email, password, company, domain}, cb) => {
    User.findOne({
      where: {email: email}
    })
    .then(result => {
      if (result !== null) {
        // a user already exists with this email
        cb(false, email, true)
      } else {
        // email is unique
        Company.findOne({
          where: {domain: domain}
        }).
        then(result => {
          if (result === null) {
            // create company
            Company.create({
              name: company,
              domain: domain
            })
            .then(result => {
              let companyId = result.id;
              // create user
              User.create({
                name: name,
                email: email,
                password: password,
                role: 'admin',
                companyId: companyId
              })
              .then(user => {
                let userInfo = {
                  name: user.name,
                  companyId: user.companyId
                }
                cb(true, userInfo, null);
              })
            })
          } else {
            // an admin user exists for the given company
            cb(false, null, null);
          }
        })
      }
    })
  },

  // updating a user's password, during forgot pw or after invitation
  updateUser: (obj) => {},

  // find a user and pass it to the callback function
  findUser: ({email}, cb) => {
    User.findOne({
      where: {email: email}
    })
    .then(result => {
      if (result === null){
        cb(result)
      } else {
        cb(result.dataValues)
      }
    })
  },

  // authenticateUser: ({email, password}, cb) => {
  //   // console.log('in authenticateUser function')
  //   User.findOne({
  //     where: {email: email}
  //   })
  //   .then(result => {
  //     if (result === null) {
  //       // no user exists with given email
  //       cb(false);
  //     } else {
  //       let hash = result.password;
  //       let name = result.name;
  //       bcrypt.compare(password, hash, function(err, response) {
  //         if (response === true) {
  //           // password matches
  //           cb(true, name);
  //         } else {
  //           // password doesn't match
  //           cb(false);
  //         }
  //       });
  //     }
  //   })
  //   .catch(err => {
  //     cb(false);
  //   })
  // },


  /////////////////////
  //    COMPANIES    //
  /////////////////////

  // creating a company
  addCompany: (obj) => {},


  /////////////////////
  //    CATEGORIES   //
  /////////////////////

  // create a category
  addCategory: ({name, description, companyId}, cb) => {
    Category.findOrCreate({
      where: {name: name, companyId: companyId}, defaults: {description: description}
    })
    .spread((user, created) => {
      cb(created);
    })
  },

  // update a Category's name or description
  updateCategory: (obj) => {},

  // removing a category
  deleteCategory: (obj) => {},

  // fetch all categories for the given company id
  fetchCategoriesByCompany: (companyId, cb) => {
    Category.findAll({
      where: {
        companyId: companyId
      },
      attributes: ['id', 'name', 'description', 'companyId']
    })
    .then(results => {
      cb(results);
    })
  },

  /////////////////////
  //     ARTICLES    //
  /////////////////////

  // create an article with content
  addArticle: (obj) => {},

  // update an article
  updateArticle: (obj) => {},

  // delete an article
  updateArticle: (obj) => {},

  // fetch all articles for a given companyId and categoryId
  fetchArticles: ({companyId, categoryId}, cb) => {
    Article.findAll({
      where: {
        companyId: companyId,
        categoryId: categoryId
      },
      attributes: ['id', 'title', 'description', 'content', 'categoryId', 'companyId']
    })
    .then(results => {
      cb(results);
    })
  },

  // fetch all articles for a given companyId
  fetchCompanyArticles: ({companyId}, cb) => {
    Article.findAll({
      where: {
        companyId: companyId
      },
      attributes: ['id', 'title', 'description', 'content', 'categoryId', 'companyId']
    })
    .then(results => {
      cb(results);
    })
  },

  //////////////////////////////
  //    TEST DATA FUNCTIONS   //
  //////////////////////////////

  clearTables: () => {
    Article.findAll().then(articles => articles.forEach(event => article.destroy()));
    Category.findAll().then(categories => categories.forEach(category => category.destroy()));
    User.findAll().then(users => users.forEach(user => user.destroy()));
    Company.findAll().then(companies => companies.forEach(company => company.destroy()));
  },

  dropTables: () => {
    db.drop();
  },

  recreateDB: () => {
    Company.sync().then(() => User.sync().then(() => Category.sync().then(() => Article.sync())));
  },

  dummyData: () => {
    //create company first
    let testCompany = Company.build({
      name: 'Test Company', domain: 'testcompany.com'
    })

    testCompany.save().then(company => {
      // create user after companyId
      let testUser = User.build({
        email: 'test1',
        role: 'admin',
        // password is same as email
        password: '$2b$10$SUgVljzdjCwkN9XEMQkSmOINmikU88HMdfz1SIQydAy3ttFwwS8Nm',
        name: 'Test Account'
      })

      // associate user with company
      testUser.setCompany(company, {save: false});

      // save user
      testUser.save();

      for (var i = 0; i < 5; i++) {

        // create category after company
        let testCategory = Category.build({
          name: `Test Category${i+1}`,
          description: `Test Description${i+1}`
        });

        // associate category with company
        testCategory.setCompany(company, {save: false});

        // save category
        testCategory.save().then(category => {

          for (var j = 0; j < 10; j++) {
            let testArticle = Article.build({
              title: `Test Article${category.id}-${j}`,
              description: `Test Article Description${category.id}-${j}`,
              content: `Test Content yada yada yada${category.id}-${j}.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum`
            });

            // associate article with category
            testArticle.setCategory(category, {save: false});
            // associate article with company
            testArticle.setCompany(company, {save: false});

            // save article and all is done
            testArticle.save();
          }

        })
      }

    })
  }
}

module.exports = dbHelpers;
