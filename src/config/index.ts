/**
 * 加盐轮数
 */
export const SALT_ROUNDS = 10;

/**
 * 验证码过期时间
 */
export const CAPTCHA_EXPIRE_TIME = 5 * 60;

/**
 * 验证码开始下标
 */
export const CAPTCHA_BEGIN_INDEX = 2;

/**
 * 验证码结束下标
 */
export const CAPTCHA_END_INDEX = 8;

/**
 * 验证码发送类型
 */
export enum CAPTCHA_KEY {
  user_register = 'captcha_user_register_',
  update_password = 'captcha_update_password_',
}
