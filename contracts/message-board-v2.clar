;; Minimal Message Board - her kullanici 1 mesaj tutar
;; Hata kodlari
(define-constant ERR-EMPTY u101)
(define-constant ERR-TOO-LONG u100)

;; principal -> message
(define-map messages principal (string-utf8 280))

(define-read-only (get-message (who principal))
  ;; Kayit yoksa "none" doner
  (default-to u"none" (map-get? messages who))
)

(define-read-only (get-my-message)
  (get-message tx-sender)
)

(define-public (set-message (content (string-utf8 280)))
  (begin
    (asserts! (> (len content) u0) (err ERR-EMPTY))
    (asserts! (<= (len content) u280) (err ERR-TOO-LONG))
    (ok (map-set messages tx-sender content))
  )
)

(define-public (clear-message)
  (ok (map-delete messages tx-sender))
)