const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const SendWelcomeEmail = (to, name) =>{
    sgMail.send({
        to,
        from: 'admin@kazeka.net',
        subject: 'Welcome To NTM',
        text: `Hi ${name} Thank you for joining the taskmanager example node application`
    }).then(() => {
        console.log('Email sent')
    }).catch((error) => {
        console.error(error)
    })
}

const SendCancellationEmail = (to, name) =>{
    sgMail.send({
        to,
        from: 'admin@kazeka.net',
        subject: "Goodbye We'll miss you!",
        text: `Hi ${name} We are sorry, if there is anything we could do please write us!`
    }).then(() => {
        console.log('Email sent')
    }).catch((error) => {
        console.error(error)
    })
}

module.exports = {
    SendWelcomeEmail,
    SendCancellationEmail
}