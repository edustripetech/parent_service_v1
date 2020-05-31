import fs from 'fs';
import ejs from 'ejs';
import util from 'util';
import path from 'path';
import 'dotenv/config';
import nodemailer from 'nodemailer';
const readFileAsync = util.promisify(fs.readFile);
const templatesDirectory = path.join(__dirname, './../mail/templates');

export default class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      port: process.env.gmailPort,
      secure: false,
      auth: {
        user: process.env.username,
        pass: process.env.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  async init(fileName) {
    this.mailTemplates = await readFileAsync(
      path.join(templatesDirectory, `${fileName}.html`),
      'utf-8',
    );
  }

  sendEmail(options, data) {
    let { recipients, from, subject, text, html } = options;

    data = data || {};

    if (!(recipients && subject && html))
      throw Error('Provide required options');
    let to = recipients;
    if (Array.isArray(to)) {
      to = to.join(',');
    }

    html = ejs.render(html, data);

    options.from = from || process.env.defaultSender;
    options.text = text || html;
    options.html = html;
    options.to = to;

    // send mail with defined transport object
    this.transporter.sendMail(options, (error) => {
      if (error) {
        return console.log(error);
      }

      console.log('Message sent!');
    });
  }

  async sendTestMail(firstname, messageFile) {
    await this.init(messageFile);
    const options = {
      //Array of recipient(s)
      recipients: ['babajide.esho@edustripe.com'],
      subject: 'Test Mail',
      html: this.mailTemplates,
    };

    const data = {
      firstname,
    };
    this.sendEmail(options, data);
  }
}
