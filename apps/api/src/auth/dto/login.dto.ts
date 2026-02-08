import { IsEmail, IsString, MinLength, Matches } from "class-validator";

export class LoginDto {
  @IsEmail({}, { message: "請輸入有效的電子郵件地址" })
  email: string;

  @IsString()
  @MinLength(8, { message: "密碼至少需要 8 個字元" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: "密碼必須包含至少一個大寫字母、一個小寫字母和一個數字",
  })
  password: string;
}
