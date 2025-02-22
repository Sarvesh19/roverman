"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Car, MapPin, Star } from "lucide-react"

export default function Profile() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-24 w-24">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">John Doe</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span>4.8 · 42 rides</span>
            </div>
          </div>
          <Button className="ml-auto">Edit Profile</Button>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upcoming">Upcoming Rides</TabsTrigger>
            <TabsTrigger value="past">Past Rides</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card className="p-6">
              <div className="space-y-4">
                {[1, 2].map((ride) => (
                  <div key={ride} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Car className="h-8 w-8 text-primary" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4" />
                        <span>Paris → Lyon</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        March 25, 2024 · 09:00 AM
                      </div>
                    </div>
                    <div className="ml-auto text-right">
                      <div className="font-semibold">€25</div>
                      <div className="text-sm text-muted-foreground">3 seats available</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <form className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100" />
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Button variant="outline">Change Photo</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="john@example.com" />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell others about yourself..."
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 234 567 890" />
                  </div>
                </div>

                <Button type="submit">Save Changes</Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}