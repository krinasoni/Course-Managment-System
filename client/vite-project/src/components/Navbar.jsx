import { Menu, School, Sun, Moon } from 'lucide-react'
import React, { useEffect } from 'react'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from './ui/sheet'
import { Link, useNavigate } from 'react-router-dom'
import { useLogoutUserMutation } from '@/features/api/authApi'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { useTheme } from '../components/ThemeProvider'


function Navbar() {
    const { setTheme } = useTheme()

    const { user } = useSelector(store => store.auth)
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation()
    const navigate = useNavigate()
    const logoutHandler = async () => {
        await logoutUser()
    }
    console.log(user)

    useEffect(() => {
        if (isSuccess) {
            toast.success(data.message || "User Logout")
            navigate("/login")
        }
    }, [isSuccess])

    return (
        <div className='h-16 dark:bg-[#020817] bg-white border-b dark:border-b-gray-800 border-b-gray-200 fixed top-0 left-0 right-0 duration-300 z-5   0'>
            <div className='max-w-7xl mx-auto hidden md:flex justify-between items-center gap-10 h-full'>
                <div className='flex items-center gap-2'>
                    <School size={"30"} />
                    <h1 className='hidden md:block font-extrabold text-2xl'>
                        <Link to="/">E-Learning</Link>
                    </h1>
                </div>
                <div className='flex items-center gap-8'>
                    {
                        user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Avatar>
                                        <AvatarImage src={user?.photoUrl || "https://github.com/shadcn.png"} alt="@shadcn" />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <Link to="my-learning">
                                            <DropdownMenuItem>My Learning</DropdownMenuItem>
                                        </Link>
                                        <Link to="profile">
                                            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                                        </Link>
                                        <DropdownMenuItem onClick={logoutHandler}>Logout</DropdownMenuItem>
                                    </DropdownMenuGroup>

                                    {user.role === "instructor" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem><Link to="/admin/dashboard">Dashboard</Link></DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className='flex item-center gap-2'>
                                <Button variant='outline' onClick={() => navigate("/login")}>Login</Button>
                                <Button onClick={() => navigate("/login")}>Signup</Button>
                            </div>
                        )
                    }
                    <div>

                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Button variant="outline" size="icon">
                                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                    <span className="sr-only">Toggle theme</span>
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="mr-5 " >
                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div className="flex md:hidden items-center justify-between px-4 h-full">
                <h1 className="font-extrabold text-2xl">E-learning</h1>
                <MobileNavbar user={user} />
            </div>
        </div>
    )
}

export default Navbar

const MobileNavbar = () => {
    const role = "instructor"
    const {setTheme} = useTheme()
    const [logoutUser, { data, isSuccess }] = useLogoutUserMutation()
    
    const logoutHandler = async () => {
        await logoutUser()
    }
    return (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
    
          <SheetContent side="right" className="flex flex-col gap-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between px-4">
              <SheetTitle className="text-xl font-bold">E-Learning</SheetTitle>
    
              {/* Dark Mode Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon" className="relative">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
    
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
    
            {/* Nav Links */}
            <nav className="flex flex-col gap-4 px-4 text-lg font-medium">
              <button className="text-left hover:text-primary transition-colors">
               <Link to="my-learning">My Learning</Link> 
              </button>
              <button className="text-left hover:text-primary transition-colors">
                <Link to="profile">Edit Profile</Link>
              </button>
              <button  onClick={logoutHandler} className="text-left text-red-600 hover:text-red-700 transition-colors">
                Log Out
              </button>
            </nav>
    
            {/* Footer */}
            {role === "instructor" && (
              <div className="mt-auto px-4">
                <SheetFooter>
                  <SheetClose asChild>
                    <Button className="w-full" variant="default">
                    <Link to="/admin/dashboard"> Go to Dashboard</Link>
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </div>
            )}
          </SheetContent>
        </Sheet>
      );
}