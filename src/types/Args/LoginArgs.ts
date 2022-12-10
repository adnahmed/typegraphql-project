import { IsEmail, Length } from "class-validator";
import { ArgsType, Field } from "type-graphql";

@ArgsType()
class LoginArgs {
    @Field()
    @Length(8)
    password: string

    /* TODO: locale aware mobile phone validation.
    * @IsMobilePhone() 
    */
    // eslint-disable-next-line type-graphql/wrong-decorator-signature
    @Field(type => Int, { nullable: true })
    @Length(10) // TODO: remove this
    mobilePhone?: number

    @Field({ nullable: true })
    @IsEmail()
    email?: string
}

export default LoginArgs;