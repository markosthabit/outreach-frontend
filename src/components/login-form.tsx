import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">سلام ونعمة</h1>
                <p className="text-muted-foreground text-balance">
                  سجل الدخول لحسابك
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">الإيميل</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password"> كلمة السر</FieldLabel>
                  <a
                    href="#"
                    className="mr-auto text-sm underline-offset-2 hover:underline">
                    نسيت كلمة السر؟
                  </a>
                </div>
                <Input id="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit">تسجيل الدخول</Button>
              </Field>
            </FieldGroup>
          </form>
          <div className=" relative hidden md:block">
            <img
              src="/logo.png"
              alt="Image"
              className="absolute inset-0 p-4 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
