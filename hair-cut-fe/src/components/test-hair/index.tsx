import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon, RotateCcw, Upload, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { fetchHairStyles } from '@/lib/api/hair-styles'
export default function TestHair() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    
    const [portraitImage, setPortraitImage] = useState<string | null>(null)
    const [selectedHairStyle, setSelectedHairStyle] = useState<number | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [currentHairObject, setCurrentHairObject] = useState<fabric.FabricImage | null>(null)
    const [isDownloading, setIsDownloading] = useState(false)
    const [hairStyles, setHairStyles] = useState<Array<{id: number, name: string, imageUrl: string}>>([])
    const [isLoading, setIsLoading] = useState(true)
  
    useEffect(() => {
      const loadHairStyles = async () => {
        try {
          const response = await fetchHairStyles()
          setHairStyles(response.data)
          setIsLoading(false)
        } catch (error) {
          console.error('Failed to fetch hair styles:', error)
          toast.error('Không thể tải danh sách kiểu tóc')
          setIsLoading(false)
        }
      }
  
      loadHairStyles()
    }, [])
  
    useEffect(() => {
      if (canvasRef.current && !fabricCanvasRef.current) {
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 600,
          height: 600,
          backgroundColor: '#f8f9fa',
          selection: true,
        })
        
        fabricCanvasRef.current = canvas
  
        canvas.on('selection:created', () => {
          canvas.getActiveObject()?.set({
            cornerColor: '#3b82f6',
            cornerStyle: 'circle',
            cornerSize: 12,
            transparentCorners: false,
            borderColor: '#3b82f6',
          })
          canvas.renderAll()
        })
      }
  
      return () => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.dispose()
          fabricCanvasRef.current = null
        }
      }
    }, [])
  
    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return
  
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        toast.error('Vui lòng tải lên ảnh định dạng JPEG hoặc PNG')
        return
      }
  
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file phải nhỏ hơn 5MB')
        return
      }
  
      setIsUploading(true)
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPortraitImage(result)
        loadPortraitToCanvas(result)
        setIsUploading(false)
        toast.success('Tải ảnh chân dung thành công!')
      }
      
      reader.onerror = () => {
        setIsUploading(false)
        toast.error('Không thể tải ảnh lên')
      }
      
      reader.readAsDataURL(file)
    }, [])
  
    const loadPortraitToCanvas = useCallback((imageUrl: string) => {
      if (!fabricCanvasRef.current) return
  
      fabric.FabricImage.fromURL(imageUrl, {
        crossOrigin: 'anonymous',
      }).then((img) => {
        const canvas = fabricCanvasRef.current!
        
        const canvasWidth = canvas.getWidth()
        const canvasHeight = canvas.getHeight()
        const imageWidth = img.width!
        const imageHeight = img.height!
        
        const scale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight)
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: (canvasWidth - imageWidth * scale) / 2,
          top: (canvasHeight - imageHeight * scale) / 2,
          selectable: false,
          evented: false,
        })
  
        canvas.backgroundImage = img
        canvas.renderAll()
      }).catch(() => {
        toast.error('Không thể tải ảnh chân dung')
      })
    }, [])
  
    const handleHairStyleSelect = useCallback((hairStyle: typeof hairStyles[0]) => {
      if (!fabricCanvasRef.current || !portraitImage) {
        toast.error('Vui lòng tải ảnh chân dung trước')
        return
      }
  
      setSelectedHairStyle(hairStyle.id)
  
      fabric.FabricImage.fromURL(hairStyle.imageUrl, {
        crossOrigin: 'anonymous',
      }).then((hairImg) => {
        const canvas = fabricCanvasRef.current!
        
        if (currentHairObject) {
          canvas.remove(currentHairObject)
        }
  
        hairImg.set({
          left: canvas.getWidth() / 2 - 100,
          top: 50,
          scaleX: 0.3,
          scaleY: 0.3,
          selectable: true,
          evented: true,
          hasControls: true,
          hasBorders: true,
          cornerColor: '#3b82f6',
          cornerStyle: 'circle',
          cornerSize: 12,
          transparentCorners: false,
          borderColor: '#3b82f6',
        })
  
        canvas.add(hairImg)
        canvas.setActiveObject(hairImg)
        canvas.renderAll()
        
        setCurrentHairObject(hairImg)
        toast.success(`Đã áp dụng ${hairStyle.name}!`)
      }).catch((e) => {
        console.log(e)
        toast.error('Không thể tải kiểu tóc')
      })
    }, [portraitImage, currentHairObject])
  
    const handleReset = useCallback(() => {
      if (!fabricCanvasRef.current || !currentHairObject) return
  
      fabricCanvasRef.current.remove(currentHairObject)
      fabricCanvasRef.current.renderAll()
      setCurrentHairObject(null)
      setSelectedHairStyle(null)
      toast.success('Đã xóa kiểu tóc')
    }, [currentHairObject])
  
    const handleClearAll = useCallback(() => {
      if (!fabricCanvasRef.current) return
  
      fabricCanvasRef.current.clear()
      fabricCanvasRef.current.backgroundColor = '#f8f9fa'
      fabricCanvasRef.current.renderAll()
      setPortraitImage(null)
      setCurrentHairObject(null)
      setSelectedHairStyle(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      toast.success('Đã xóa tất cả')
    }, [])
  
    const handleDownload = useCallback(() => {
      if (!fabricCanvasRef.current || !portraitImage) {
        toast.error('Vui lòng tải ảnh chân dung trước khi tải xuống')
        return
      }
  
      setIsDownloading(true)
      
      try {
        fabricCanvasRef.current.discardActiveObject()
        fabricCanvasRef.current.renderAll()
  
        const dataURL = fabricCanvasRef.current.toDataURL({
          format: 'png',
          quality: 1,
          multiplier: 2, 
        })
  
        const link = document.createElement('a')
        link.download = `kieu-toc-ao-${new Date().getTime()}.png`
        link.href = dataURL
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
  
        toast.success('Đã tải xuống ảnh thành công!')
      } catch (error) {
        console.error('Download error:', error)
        toast.error('Không thể tải xuống ảnh')
      } finally {
        setIsDownloading(false)
      }
    }, [portraitImage])
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Thử Kiểu Tóc Ảo
            </h1>
            <p className="text-gray-600 text-lg">
              Tải ảnh của bạn và thử các kiểu tóc khác nhau!
            </p>
          </div>
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Section */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Tải Ảnh Chân Dung
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    
                    {portraitImage ? (
                      <div className="relative">
                        <img
                          src={portraitImage}
                          alt="Ảnh chân dung"
                          className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleClearAll}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-48 border-dashed border-2 hover:border-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        <div className="text-center">
                          <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            {isUploading ? 'Đang tải lên...' : 'Nhấn để tải ảnh chân dung'}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            JPEG hoặc PNG (tối đa 5MB)
                          </div>
                        </div>
                      </Button>
                    )}
                  </div>
                  
                  {portraitImage && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Thay Đổi Ảnh
                    </Button>
                  )}
                </CardContent>
              </Card>
  
              {/* Hair Styles Section */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Kiểu Tóc</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-600">Đang tải kiểu tóc...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {hairStyles.map((style) => (
                        <div
                          key={style.name}
                          className={`cursor-pointer rounded-lg border-2 p-2 transition-all hover:shadow-md ${
                            selectedHairStyle === style.id
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleHairStyleSelect(style)}
                        >
                          <img
                            src={style.imageUrl}
                            alt={style.name}
                            className="w-full h-20 object-cover rounded"
                          />
                          <p className="text-xs text-center mt-1 font-medium">
                            {style.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
  
            {/* Canvas Section */}
            <div className="lg:col-span-2">
              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Xem Trước</span>
                    <div className="flex gap-2">
                      {portraitImage && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownload}
                          disabled={isDownloading}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          {isDownloading ? 'Đang tải...' : 'Tải Xuống'}
                        </Button>
                      )}
                      {currentHairObject && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReset}
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Đặt Lại Tóc
                        </Button>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden shadow-lg">
                      <canvas ref={canvasRef} />
                    </div>
                  </div>
                  
                  {portraitImage && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Chọn kiểu tóc từ bảng bên trái</li>
                        <li>• Nhấn và kéo để di chuyển tóc</li>
                        <li>• Sử dụng các góc để thay đổi kích thước</li>
                        <li>• Sử dụng điều khiển xoay để xoay tóc</li>
                        <li>• Nhấn "Đặt Lại Tóc" để xóa kiểu tóc hiện tại</li>
                        <li>• Nhấn "Tải Xuống" để lưu kết quả</li>
                      </ul>
                    </div>
                  )}
                  
                  {!portraitImage && (
                    <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">
                        Tải lên ảnh chân dung để bắt đầu thử kiểu tóc
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }