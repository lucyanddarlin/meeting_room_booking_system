import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      host: 'smtp.qq.com',
      port: 587,
      secure: false,
      auth: {
        user: '1194486835@qq.com',
        pass: 'rqkbnpomhnqziedf',
      },
    });
  }

  /**
   * 发送验证码
   */
  async sendCaptcha({ to, subject, html }: any) {
    await this.transporter.sendMail({
      from: {
        name: '会议室预订系统',
        address: '1194486835@qq.com',
      },
      to,
      subject,
      html,
    });
  }
}
