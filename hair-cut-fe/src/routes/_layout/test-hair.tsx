import { createFileRoute } from '@tanstack/react-router'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as fabric from 'fabric' 
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageIcon, RotateCcw, Upload, Trash2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { fetchHairStyles } from '@/lib/api/hair-styles'
import TestHair from '@/components/test-hair'

export const Route = createFileRoute('/_layout/test-hair')({
  component: TestHair,
})


