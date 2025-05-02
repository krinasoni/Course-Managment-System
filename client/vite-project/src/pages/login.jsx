//iQyUt6izjbasFjZT
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useLoginUserMutation, useRegisterUserMutation } from "../features/api/authApi.js"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

const Login = () => {
  const [signupInput, setSignupInput] = useState({ name: "", email: "", password: "" });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [registerUser, { data: registerData, error: registerError, isLoading: registerLoading, isSuccess: registerSuccess }] = useRegisterUserMutation()
  const [loginUser, { data: loginData, error: loginError, isLoading: loginLoading, isSuccess: loginSuccess }] = useLoginUserMutation()
  const navigate = useNavigate();

  const changeHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value })
    }
  }

  const handleRegistration = async (type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    const action = type === "signup" ? registerUser : loginUser;
    await action(inputData)
  }

  useEffect(() => {
    if(registerSuccess && registerData){
      toast.success(registerData.message || "Signup Successful.")
    }
    if(registerError){
      toast.error(registerError.data.message || "Signup Failed")
    }
    if(loginSuccess && loginData){
      toast.success(loginData.message || "Login Successful.")
      navigate("/")
    }
    if(loginError){
      toast.error(loginError.data.message || "Login Failed")
    }
  }, [loginLoading, registerLoading, loginData, registerData, loginError, registerError])


  return (
    <div className="flex item-center w-full justify-center mt-20">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  placeholder="Eg. Abc"
                  onChange={(e) => { changeHandler(e, "signup") }}
                  required="true" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  placeholder="Eg. Abc@gmail.com"
                  onChange={(e) => { changeHandler(e, "signup") }}
                  required="true" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  placeholder="Eg. xyz"
                  onChange={(e) => { changeHandler(e, "signup") }}
                  required="true" />
              </div>
            </CardContent>
            <CardFooter>
              <Button disable={registerLoading} onClick={() => handleRegistration("signup")}>
                {
                  registerLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                    </>
                  ) : "Signup"
                }
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Login your password here. After saving, you'll be logged in
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="current">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  placeholder="Eg. abc@gmail.com"
                  onChange={(e) => { changeHandler(e, "login") }}
                  required="true" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="new">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={loginInput.password}
                  placeholder=" Eg. xyz"
                  onChange={(e) => { changeHandler(e, "login") }}
                  required="true" />
              </div>
            </CardContent>
            <CardFooter>
              <Button disable={loginLoading} onClick={() => handleRegistration("login")}>
                {
                  loginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                    </>
                  ) : "Login"
                }
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

  )
}

export default Login