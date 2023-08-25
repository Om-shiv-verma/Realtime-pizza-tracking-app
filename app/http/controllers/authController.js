const User = require('../../models/user')
const bcrypt = require('bcrypt')
const passport = require('passport')

function authController(){
    return{
        // 1
        login(req, res) {
            res.render('auth/login')
        },
        // 2
        postLogin(req, res, next){
            const {email, password} = req.body
            //validate request
            if(!email || !password){
                req.flash('error','All fields are required')
                return res.redirect('/login')
            }
            passport.authenticate('local', (err, user, info) => {
                if(err){
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err){
                        req.flash('error', info.message)
                        return next(err)
                    }
                    return res.redirect('/')
                })
            })(req, res, next)
        },
        // 3
        register(req,res){
            res.render('auth/register')
        },
        // 4
        async postRegister(req, res){
            const {name, email, password} = req.body
            //validate request
            if(!name || !email || !password){
                req.flash('error','All fields are required')
                req.flash('name', name)
                req.flash('email',email)
                return res.redirect('/register')
            }
            // //check if email exists
            // const user1 = await User.find({email: email})
            // if (user1){
            //         req.flash('error','Email already taken')
            //         req.flash('name', name)
            //         req.flash('email',email)
            //         return res.redirect('/register')
            // }

            //Hash password 
            const hashedPassword = await bcrypt.hash(password, 10)
            //Create a user
            const user = new User({
                name,
                email,
                password:hashedPassword
            })

            user.save().then((user) => {
                //login
                return res.redirect('/')
            }).catch(err => {
                req.flash('error','Something went wrong')
                return res.redirect('/register')
                console.log(err);
            })
        },
        
        logout(req, res, next) {
            req.logout((err) => {
                if (err){
                   return next(err)
                }
                res.redirect('/login');
            });
        }
        

    }
}
module.exports = authController