"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertCircle } from "lucide-react"

interface WhatsAppSettingsDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function WhatsAppSettingsDialog({ isOpen, onClose }: WhatsAppSettingsDialogProps) {
  const [settings, setSettings] = useState({
    apiKey: "",
    phoneNumber: "",
    businessName: "VasifyTech",
    autoReminders: true,
    reminderFrequency: "daily",
    maxRetries: "3",
  })

  const [isConnected, setIsConnected] = useState(false)

  const handleSave = () => {
    // Mock save functionality
    alert("WhatsApp settings saved successfully!")
    onClose()
  }

  const testConnection = () => {
    // Mock connection test
    setIsConnected(true)
    alert("WhatsApp connection test successful!")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>WhatsApp Business API Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Connection Status
                {isConnected ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Disconnected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Configure your WhatsApp Business API integration</CardDescription>
            </CardHeader>
          </Card>

          {/* API Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">WhatsApp Business API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={settings.apiKey}
                onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                placeholder="Enter your WhatsApp Business API key"
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber">Business Phone Number</Label>
              <Input
                id="phoneNumber"
                value={settings.phoneNumber}
                onChange={(e) => setSettings({ ...settings, phoneNumber: e.target.value })}
                placeholder="+1234567890"
              />
            </div>

            <div>
              <Label htmlFor="businessName">Business Name</Label>
              <Input
                id="businessName"
                value={settings.businessName}
                onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                placeholder="Your business name"
              />
            </div>
          </div>

          {/* Automation Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>Configure automatic reminder behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoReminders">Enable Auto Reminders</Label>
                  <p className="text-sm text-gray-600">Automatically send renewal reminders</p>
                </div>
                <Switch
                  id="autoReminders"
                  checked={settings.autoReminders}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoReminders: checked })}
                />
              </div>

              <div>
                <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                <select
                  id="reminderFrequency"
                  value={settings.reminderFrequency}
                  onChange={(e) => setSettings({ ...settings, reminderFrequency: e.target.value })}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <Label htmlFor="maxRetries">Max Retry Attempts</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  min="1"
                  max="10"
                  value={settings.maxRetries}
                  onChange={(e) => setSettings({ ...settings, maxRetries: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={testConnection}>
              Test Connection
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
