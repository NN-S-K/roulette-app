"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Edit, Plus, Settings } from "lucide-react"

export default function TopicRoulette() {
  // デフォルトのお題リスト
  const defaultTopics = [
    "好きな食べ物について語る",
    "子供の頃の思い出を話す",
    "理想の休日を説明する",
    "もし魔法が使えたら何をする？",
    "今一番欲しいものは？",
    "尊敬する人について話す",
    "好きな季節とその理由",
    "もし時間を止められたら？",
    "今日の良かったことを3つ",
    "もし動物と話せたら？",
    "好きな映画やドラマについて",
    "将来の夢を語る",
    "もし宝くじが当たったら？",
    "好きな音楽について話す",
    "今までで一番嬉しかったこと",
    "もし透明人間になれたら？",
    "好きな場所について語る",
    "今チャレンジしたいこと",
  ]

  // 状態管理
  const [topics, setTopics] = useState<string[]>(defaultTopics)
  const [currentTopic, setCurrentTopic] = useState<string>("")
  const [displayTopic, setDisplayTopic] = useState<string>("")
  const [isSpinning, setIsSpinning] = useState(false)
  const [newTopic, setNewTopic] = useState("")
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")
  const [isManageOpen, setIsManageOpen] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // ローカルストレージからお題を読み込み
  useEffect(() => {
    const savedTopics = localStorage.getItem("roulette-topics")
    if (savedTopics) {
      setTopics(JSON.parse(savedTopics))
    }
  }, [])

  // お題をローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("roulette-topics", JSON.stringify(topics))
  }, [topics])

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // フラッシュ暗算風のルーレット回転（2秒で停止）
  const spinRoulette = () => {
    if (isSpinning || topics.length === 0) return

    setIsSpinning(true)
    setCurrentTopic("")

    // 最終的に選ばれるお題をランダムに決定
    const finalIndex = Math.floor(Math.random() * topics.length)
    const finalTopic = topics[finalIndex]

    let currentIndex = 0
    let speed = 30 // 初期速度（30ms）
    const startTime = Date.now()
    const totalDuration = 2000 // 2秒で停止

    // 高速でお題を切り替える関数
    const flashTopics = () => {
      const elapsed = Date.now() - startTime
      const progress = elapsed / totalDuration

      setDisplayTopic(topics[currentIndex % topics.length])
      currentIndex++

      if (progress < 1) {
        // 2秒かけて徐々に減速（指数関数的に減速）
        speed = 30 + progress * progress * 200 // 30ms → 230ms
        intervalRef.current = setTimeout(flashTopics, speed)
      } else {
        // 最終的に選ばれたお題を表示
        setDisplayTopic(finalTopic)
        setCurrentTopic(finalTopic)
        setIsSpinning(false)
      }
    }

    // フラッシュ開始
    flashTopics()
  }

  // お題を追加
  const addTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()])
      setNewTopic("")
    }
  }

  // お題を削除
  const deleteTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index))
  }

  // お題を編集開始
  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditingText(topics[index])
  }

  // お題を編集保存
  const saveEdit = () => {
    if (editingIndex !== null && editingText.trim()) {
      const newTopics = [...topics]
      newTopics[editingIndex] = editingText.trim()
      setTopics(newTopics)
      setEditingIndex(null)
      setEditingText("")
    }
  }

  // 編集をキャンセル
  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingText("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* タイトルと設定ボタン */}
        <div className="text-center relative">
          <h1 className="text-3xl font-bold text-orange-800 mb-2">🎰 お題ルーレット</h1>
          <p className="text-orange-600">ルーレットを回してお題を決めよう！</p>

          <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="absolute top-0 right-0 bg-white/80">
                <Settings className="w-4 h-4 mr-1" />
                お題管理
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>お題の管理</DialogTitle>
              </DialogHeader>

              {/* 新しいお題を追加 */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="新しいお題を入力..."
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTopic()}
                  />
                  <Button onClick={addTopic} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* お題リスト */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {topics.map((topic, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      {editingIndex === index ? (
                        <>
                          <Textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 min-h-[60px]"
                          />
                          <div className="flex flex-col gap-1">
                            <Button onClick={saveEdit} size="sm" variant="outline">
                              保存
                            </Button>
                            <Button onClick={cancelEdit} size="sm" variant="outline">
                              キャンセル
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">{topic}</span>
                          <Button onClick={() => startEditing(index)} size="sm" variant="ghost">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => deleteTopic(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* ルーレット表示エリア */}
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-orange-200 shadow-xl">
          <CardContent className="p-12">
            <div className="text-center min-h-[200px] flex items-center justify-center">
              {isSpinning ? (
                <div className="space-y-6">
                  <div className="text-6xl animate-spin">🎰</div>
                  <div
                    className={`text-3xl font-bold text-gray-800 leading-relaxed transition-all duration-100 ${
                      isSpinning ? "animate-pulse" : ""
                    }`}
                    style={{
                      minHeight: "120px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {displayTopic || "回転中..."}
                  </div>
                </div>
              ) : currentTopic ? (
                <div className="space-y-6">
                  <div className="text-4xl">🎉</div>
                  <p className="text-3xl font-bold text-gray-800 leading-relaxed">{currentTopic}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-6xl">🎰</div>
                  <p className="text-gray-500 text-xl">ルーレットを回してお題を決めよう！</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ルーレットボタン */}
        <div className="text-center">
          <Button
            onClick={spinRoulette}
            disabled={isSpinning || topics.length === 0}
            size="lg"
            className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSpinning ? "🎰 回転中..." : "🎰 ルーレットを回す"}
          </Button>
        </div>

        {/* フッター */}
        <div className="text-center text-sm text-orange-600/70 mt-8">全{topics.length}種類のお題からランダムに選択</div>
      </div>
    </div>
  )
}
