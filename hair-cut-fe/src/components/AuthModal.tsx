import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type AuthModalProps = {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  type: 'login' | 'register'
  setType: (type: 'login' | 'register') => void
}

const loginSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, 'Số điện thoại không được bỏ trống')
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  password: z
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .max(50, 'Mật khẩu không được quá 50 ký tự'),
})

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'Tên không được bỏ trống')
      .max(50, 'Tên không được quá 50 ký tự'),
    lastName: z
      .string()
      .min(1, 'Họ không được bỏ trống')
      .max(50, 'Họ không được quá 50 ký tự'),
    phoneNumber: z
      .string()
      .min(1, 'Số điện thoại không được bỏ trống')
      .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
    password: z
      .string()
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
      .max(50, 'Mật khẩu không được quá 50 ký tự'),
    repeatPassword: z.string(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Mật khẩu không khớp',
    path: ['repeatPassword'],
  })

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  setIsOpen,
  type,
  setType,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
    },
  })

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
  })

  const onLoginSubmit = (data: LoginFormValues) => {
    setIsLoading(true)

    setTimeout(() => {
      console.log('Login submitted:', data)
      setIsLoading(false)
      setIsOpen(false)
      loginForm.reset()
    }, 1000)
  }

  const onRegisterSubmit = (data: RegisterFormValues) => {
    setIsLoading(true)

    setTimeout(() => {
      console.log('Registration submitted:', data)
      setIsLoading(false)
      setIsOpen(false)
      registerForm.reset()
    }, 1000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            {type === 'login' ? 'Đăng Nhập' : 'Đăng Ký'}
          </DialogTitle>
        </DialogHeader>

        <Tabs
          value={type}
          onValueChange={(value) => setType(value as 'login' | 'register')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Đăng Nhập</TabsTrigger>
            <TabsTrigger value="register">Đăng Ký</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4 py-4"
              >
                <FormField
                  control={loginForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Nhập mật khẩu"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 font-normal"
                    type="button"
                  >
                    Quên mật khẩu?
                  </Button>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="register">
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                className="space-y-4 py-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tên</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập tên" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ</FormLabel>
                        <FormControl>
                          <Input placeholder="Nhập họ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={registerForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Nhập mật khẩu"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="repeatPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Nhập lại mật khẩu"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800"
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng Ký'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Bằng cách đăng ký, bạn đồng ý với{' '}
                  <a
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Điều khoản dịch vụ
                  </a>{' '}
                  và{' '}
                  <a
                    href="#"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Chính sách bảo mật
                  </a>{' '}
                  của chúng tôi.
                </p>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-center">
          <span className="text-sm text-muted-foreground">
            {type === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          </span>
          <Button
            variant="link"
            className="text-sm font-medium"
            onClick={() => setType(type === 'login' ? 'register' : 'login')}
          >
            {type === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal
