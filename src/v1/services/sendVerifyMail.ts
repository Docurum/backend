import config from "@v1/config";
import fs from "fs";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import mg from "nodemailer-mailgun-transport";
import path from "path";

const base64Encode = (file: string): any => {
  // read binary data
  const bitmap = fs.readFileSync(file);
  // convert binary data to base64 encoded string
  return Buffer.from(bitmap).toString("base64");
};

interface Ireplacements {
  name: string;
  email: string;
  link: string;
  year: number;
}

const sendVerifyMail = async (replacements: Ireplacements, mailList: string): Promise<any> => {
  const filePath = path.join(__dirname, "../assets/static/verifyMail.html");
  const subject = "Activate your Docurum account";
  console.log(replacements);
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, { encoding: "utf-8" });
    const transport = nodemailer.createTransport(
      mg({
        auth: {
          api_key: config.MAILGUN_API_KEY,
          domain: config.MAILGUN_DOMAIN,
        },
      })
    );
    const b64 = base64Encode(path.join(__dirname, "../assets/images/Logo-text.png"));
    const template = handlebars.compile(html);
    const htmlToSend = template(replacements);
    const mailOptions = {
      from: config.GMAIL_ACCOUNT,
      to: mailList,
      subject,
      attachments: [
        {
          cid: "logo.png",
          content: b64,
          encoding: "base64",
        },
      ],
      html: htmlToSend,
    };
    return await transport.sendMail(mailOptions);
  }
  throw new Error("File Not Found");
};

export default sendVerifyMail;
