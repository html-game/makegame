// ---------------------------------------------------------
// �Q�[���p��javascript���C�u����
// ---------------------------------------------------------
// 画面の大きさ(縦、横)
var S_WIDTH  = 640;
var S_HEIGHT = 480;
// タイトルシーンの定義
var SceneTitle = function (imageManager) {

	this.imageManager = imageManager;
	this.imageTitle   = this.imageManager.getImage("img/title.png");
};

// タイトルシーンの原型
SceneTitle.prototype = {

	init : function () {
	
	},
	// 動作
	action : function (keyEvent) {

		// Zを押した時の動作
		if (keyEvent.z) {
		
			// Zをおしたらメインシーンが始まる
			return new SceneMain(this.imageManager);
		}
		
		return null;
	}, 
    //描写
	render : function (ctx) {
		
		// シーンの塗りつぶし
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect( 0 , 0 , S_WIDTH , S_HEIGHT );

		// canvas上に指定の画像を描画
		ctx.drawImage(this.imageTitle, S_WIDTH / 2 - 299 / 2, 150);
		
		/* タイトル　フォントサイズ */
		ctx.font = "35px 'arial'";
		// 線のスタイルカラー
		ctx.strokeStyle = "green";
		// タイトルメッセージ
		var MESSAGE = "Press z key to Start";
		// テキストの描画幅を測定
		var metricsLabel = ctx.measureText(MESSAGE);
		
		/*指定座標に描画する*/
		ctx.strokeText(MESSAGE, S_WIDTH / 2 - metricsLabel.width / 2 , S_HEIGHT / 2);
	},
	
};

// メインシーン（プレイシーン）の定義
var SceneMain = function (imageManager) {

	this.imageManager = imageManager;

	this.player        = new Player(imageManager.getImage("img/player.png"));　//プレイヤーインスタンス
	this.playerBullets = new Array();　　　　　　　　　　　　　　　　　　　　　　　//弾インスタンス
	this.objects       = new Array();　　　　　　　　　　　　　　　　　　　　　　　//対象インスタンス
	this.deadObjects   = new Array();　　　　　　　　　　　　　　　　　　　　　　　//死の対象インスタンス
	this.backObjects   = new Array();　　　　　　　　　　　　　　　　　　　　　　　//背景物(月の画像)の対象インスタンス
	
	this.score         = new Score(this.player);　　　　　　　　　　　　　　　　　//スコア
	this.life          = new Life(this.player);　　　　　　　                   //ライフ
	
	this.diffcult = 100;              //不具合
	
	this.gameover = false;            //ゲームオーバー　　　　　　　　　　　　　　　　　　　　　　　
	this.gameoverTime = 300;          //ゲームオーバーからタイトルの戻るまでの時間（３秒）
};

// メインシーンの原型
SceneMain.prototype = {

	init : function () {
	
		this.score.init();
		this.life.init();

		// プレイヤー座標　[iw(image width)=プレイヤー画像の幅]  [ih(image heigth)=プレイヤー画像の高さ]
		this.player.x = S_WIDTH      - this.player.iw - 610;
        this.player.y = S_HEIGHT / 2 - this.player.ih /   2;
        
		
		// 背景物（月の画像）の定義
		var b = new BackObj(this.imageManager.getImage("img/back-obj.png"));
		b.init();
		this.backObjects.push(b);

		this.gameover = false;
		this.gameoverTime = 300;

	},
　　　// 動作
	action : function (keyEvent) {

		this.gameoverTime--;
		if (this.gameoverTime < 0) {
			this.gameoverTime = 0;
		}
		
		if (this.gameover && this.gameoverTime <= 0) {
			return new SceneTitle(this.imageManager);
			
		}
        // 乱数を定義＝0～99の整数値の乱数を生成
		var rand = Math.floor( Math.random() * 100 );
		
		// 
		if (rand % this.diffcult == 0) {
            //Xランダム生成
            //var randXOffset = Math.floor( Math.random() * 570 ) + 10;
            //Yランダム生成
			var randYOffset = Math.floor(Math.random() * 410 ) + 10;
			var rand = Math.floor( Math.random() * 100 );
			
			// 敵２の出現確率
			if (rand % 8 == 0) {
			
				var o = new EnemyDash(this.imageManager.getImage("img/enemy-dash.png"), this.player);
                o.init();
                
				//o.x   = randXOffset;
				//o.y   = -70;
				o.y   = randYOffset;
				o.x   = 680;
				this.objects.push(o);
			
			// 敵１の出現確率
			} else if(rand % 5 == 0){
			
			
				var o = new Enemy(this.imageManager.getImage("img/enemy.png"));
                o.init();
                //o.x = randXOffset;
				o.y = randYOffset;
                //o.y = -70;
                //敵生成位置
                o.x = 680;
				
				this.objects.push(o);
			}
			
			this.diffcult -= 10;
			
			if (this.diffcult <= 10) {
				this.diffcult = 10;
			}
		}
		
		// ------------------------------------------
		// �����蔻��
		// ------------------------------------------
		// 内部スクリーンの調整
		this.adjustInnerScreen(this.player);

		if (!this.player.star) {
		
			//　対象の繰り返し処理 
			for (i = 0; i < this.objects.length; i++) {
				
				// objects(対象＝敵)　プレイヤーが敵に当たった場合の繰り返し処理
				if (　this.isHit(this.objects[i], this.player)  ||　this.isHit(this.player  , this.objects[i]) )  {

					// プレイヤーと敵のヒットポイント
					this.player.hp     -= this.objects[i].attack;
					this.objects[i].hp -= this.player.attack;
					
					this.player.star = true;
					this.player.starTime = 300;
					
				}

			}
		}

		// 対象の繰り返し処理 
		for (i = 0; i < this.objects.length; i++) {
			
			// プレイヤーの弾丸の繰り返し処理
			for (j = 0; j < this.playerBullets.length; j++) {
			
				// 弾丸が敵に当たった場合
				if (this.isHit(this.objects[i] , this.playerBullets[j] ) ||　this.isHit(this.playerBullets[j]　, this.objects[i]))  {

					// 弾丸と敵のヒットポイント
					this.playerBullets[j].hp  -= this.objects[i].attack;
					this.objects[i].hp        -= this.playerBullets[j].attack;
					
				}

			}
			
		}
		
		// プレイヤーの死＝ヒットポイント（ライフ）が０以下の場合
		if (!this.player.dead && this.player.hp <= 0) {
			
			// プレイヤーは死ぬ
			this.player.dead = true;
			// 死の対象の生成
			this.generateDeadObj(this.player);
			
			this.gameover = true;
			this.gameoverTime = 300;
		}
		
		for (i = 0; i < this.objects.length; i++) {
			
			// 対象（敵)のヒットポイント（ライフ）が０以下の場合
			if (this.objects[i].hp <= 0) {
				
				// 死の対象の生成
				this.generateDeadObj(this.objects[i]);
			
				this.objects.splice(i, 1);
				i--;
				
				break;
			}
			// また範囲外（死なない）の場合
			else if (this.isOutOfRange(this.objects[i])) {

				// 死の対象の生成
				this.generateDeadObj(this.objects[i]);
			
				this.objects.splice(i, 1);
				i--;
				continue;
			}
		}
		
		// 弾丸の繰り返し処理
		for (i = 0; i < this.playerBullets.length; i++) {
			
			//　弾が当たらなかった場合
			if (this.playerBullets[i].hp <= 0) {
			
				this.playerBullets.splice(i, 1);
				i--;
				continue;
			}
			// また範囲外の場合
			else if (this.isOutOfRange(this.playerBullets[i])) {
				this.playerBullets.splice(i, 1);
				i--;
				continue;
			}
		}
		

		// ------------------------------------------
		// スコアとライフの実行
		// ------------------------------------------
		this.score.action();
		this.life.action();
		
		var b = this.player.action(keyEvent);
		if (b != null) {
			this.playerBullets.push(b);
		}
		
		for (i = 0; i < this.backObjects.length; i++) {
			this.backObjects[i].action();
		}
		for (i = 0; i < this.playerBullets.length; i++) {
			this.playerBullets[i].action();
		}
		for (i = 0; i < this.objects.length; i++) {
			this.objects[i].action();
		}
		for (i = 0; i < this.deadObjects.length; i++) {
			if (!this.deadObjects[i].action()) {
				this.deadObjects.splice(i, 1);
				i--;
			}
		}

	}, 

	render : function (ctx) {
		
		// シーンの塗りつぶし
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect( 0 , 0 , S_WIDTH , S_HEIGHT);

		// ------------------------------------------
		// スコアとライフの描写
		// ------------------------------------------
		this.score.render(ctx);
		this.life.render(ctx);
		
		for (i = 0; i < this.backObjects.length; i++) {
			this.backObjects[i].render(ctx);
		}
		
		for (i = 0; i < this.objects.length; i++) {
			this.objects[i].render(ctx);
		}
　　　　　//プレイヤーの描写
		this.player.render(ctx);
		
		for (i = 0; i < this.playerBullets.length; i++) {
			this.playerBullets[i].render(ctx);
		}

		for (i = 0; i < this.deadObjects.length; i++) {
			this.deadObjects[i].render(ctx);
		}
		
	},
	// 死のオブジェクトの生成
	generateDeadObj : function (obj) {
	
		var d = new DeadObj(obj);
		d.init();
		
		this.deadObjects.push(d);
	}, 
	

	// 当たり判定の範囲＝敵同士が重なる
	isHit : function (obj1, obj2) {
		
		// 敵１・敵２の左(left)、右(right)、上(top)、下(below)の定義
		var obj1L = obj1.x + (obj1.iw / 2) - (obj1.w / 2);
		var obj1R = obj1.x + (obj1.iw / 2) + (obj1.w / 2);
		var obj1T = obj1.y + (obj1.ih / 2) - (obj1.h / 2);
		var obj1B = obj1.y + (obj1.ih / 2) + (obj1.h / 2);
		
		var obj2L = obj2.x + (obj2.iw / 2) - (obj2.w / 2);
		var obj2R = obj2.x + (obj2.iw / 2) + (obj2.w / 2);
		var obj2T = obj2.y + (obj2.ih / 2) - (obj2.h / 2);
		var obj2B = obj2.y + (obj2.ih / 2) + (obj2.h / 2);
		
		// 敵１と敵２がそれぞれが全方向から重なっても問題がおきないようにするif文
		
		// 
		if (obj1L <= obj2L && obj2L <= obj1R &&
			obj1T <= obj2T && obj2T <= obj1B) {
			
			return true;
		}
		
		// �E��
		if (obj1L <= obj2R && obj2R <= obj1R &&
			obj1T <= obj2T && obj2T <= obj1B) {
			
			return true;
		}
		
		// ����
		if (obj1L <= obj2L && obj2L <= obj1R &&
			obj1T <= obj2B && obj2B <= obj1B) {
			
			return true;
		}
		
		// �E��
		if (obj1L <= obj2R && obj2R <= obj1L &&
			obj1T <= obj2B && obj2B <= obj1B) {
			
			return true;
		}
		
		return false;
	},

	// 範囲外の余白
	isOutOfRange : function (obj) {
	　　　//余白の定義（範囲外）
		var X_MARGIN = 100;
		var Y_MARGIN = 100;
	
		if (obj.x <= -1 * X_MARGIN) {
		
			return true;
			
		}
		
		if (obj.x + obj.iw >= S_WIDTH + X_MARGIN) {
		
			return true;
			
		}
		
		if (obj.y <= -1 * Y_MARGIN) {
		
			return true;
			
		}
		
		if (obj.y + obj.ih >= S_HEIGHT + Y_MARGIN) {
		
			return true;
			
		}
		
		return false;
	},
	

	// 内部スクリーンの余白
	adjustInnerScreen : function (obj) {
	　　　//余白の座標の定義（内部スクリーン）
		var X_MARGIN = 50;
		var Y_MARGIN = 50;
	
		if (obj.x <= 0) {
		
			obj.x = 0;
			
		}
		
		if (obj.x + obj.iw >= S_WIDTH) {
		
			obj.x = S_WIDTH - obj.iw;
			
		}
		
		if (obj.y <= 0) {
		
			obj.y = 0;
			
		}
		
		if (obj.y + obj.ih >= S_HEIGHT) {
		
			obj.y = S_HEIGHT - obj.ih;
			
		}
		
		return false;
	}

};

// 弾丸の定義
var PlayerBullet = function (image) {

	this.x       =  0;   //縦座標
	this.y       =  0;   //横座標
	this.w       = 10;   //幅
	this.h       =  5;   //高さ
	this.iw      = 10;   //画像幅
	this.ih      =  5;   //画像高さ
	
	this.move    = 4;    //弾丸の移動
	
	this.hp      =  1;   //与えるダメージ量（ヒットポイント）
	this.attack  =  2;   
	
	this.image = image;
	
	this.alpha  = 1.0;   //
	this.alphaA = 0.01;
};

// プレイヤーの弾丸の原型
PlayerBullet.prototype = {

	init : function () {
	
	}, 
	
	// 動作
	action : function (keyEvent) {
        //弾丸を上方向で撃つ
        //this.y -= this.move;
        //弾丸を右方向で撃つ
        this.x += this.move;
	},

	// 描写
	render : function (ctx) {
	
		if (this.alpha >= 1.0) {
			this.alphaA = -0.01;
		} else if (this.alpha <= 0.5) {
			this.alphaA =  0.01;
		}
		
		this.alpha += this.alphaA;
	
		// 弾丸シーンの塗りつぶし
		ctx.fillStyle = 'rgba(255, 255, 255, ' + this.alpha + ')';
		ctx.fillRect(this.x　, this.y , this.w , this.h);
	}
};

// プレイヤーの定義
var Player = function (image) {

	this.x       = 0;
	this.y       = 0;
	this.w       = 30;
	this.h       = 21;
	this.iw      = 52;
	this.ih      = 42;
	
	this.move    = 3;
	
	this.hp      = 5;   //ライフの数
	this.attack  = 1;
	
	this.image = image;
	
	this.shootDelay = 0;   //弾丸の発射遅れ
	
	this.dead      = false;
	this.star      = false; // ���G�t���O
	this.starTime  = 30; // ���G����
	
	this.left1Press   = false;
	this.left1Up      = false;
	this.left2Press   = false;
	
	this.leftLatestPressTime = 0;   //最新のプレス時間
	this.leftLatestUpTime = 0;      //最新の更新日時
	
	this.leftDash     = false;
	this.leftDashTime = 0;
};
// プレイヤー原型
Player.prototype = {
	
	init : function () {
	
	}, 
	// 動作
	action : function (keyEvent) {
	
		if (this.dead) {
			
			return;
		}
		// xを押すと移動スピードが半分になる
		if (keyEvent.x)    {
			this.move = 1;
		} else {
			this.move = 3;
		}
	
		// 移動したときの座標
		if (keyEvent.up)    {
			this.y -= this.move;
		}
		if (keyEvent.down)  {
			this.y += this.move;
		}
		if (keyEvent.left)  {
			this.x -= this.move;
		}
		if (keyEvent.right) {
			this.x += this.move;
		}

		var s = null;
		
		// zが押されたとき
		if (keyEvent.z && this.shootDelay <= 0) {
			s = new PlayerBullet();
			s.init();
			s.x = this.x + this.iw;
			s.y = this.y + (this.iw / 2) - (s.w / 2);
			
			this.shootDelay = 10;
		}

		// 
		if (this.shootDelay > 0) this.shootDelay--;

		this.starTime--;
		if (this.starTime < 0) {
			this.starTime = 0;
		}
		if (this.starTime <= 0) {
			this.starTime = 0;
			this.star     = false;
		}

		return s;
	},
	
	render : function (ctx) {
	
		if (this.dead) {
			return;
		}
		
		
		if (this.star) {
		
			if (this.starTime % 5 == 0) {
			
				// 
			} else {
				// プレイヤー画像の描画
				ctx.drawImage(this.image, this.x, this.y);
			}
			
			} else {
	
			// �
			ctx.drawImage(this.image, this.x, this.y);
		
		}
	}

};
// 敵１の定義
var Enemy = function (image) {

	this.x       = 0;
	this.y       = 0;
	this.w       = 38;
	this.h       = 42;
	this.iw      = 38;
	this.ih      = 42;
	
	this.move    = 1.5;    // 移動スピード
	
	this.hp      = 1;    // ヒットポイント（ライフ）
	this.attack  = 1;    // 攻撃力
	
	this.image = image;
};
// 敵の原型
Enemy.prototype = {
	
	init : function () {
        
	}, 
	
	action : function () {
	    // 下方向に移動してくる
		//this.y += this.move;
		//　横方向に移動してくる
		this.x -= this.move;
	},

	render : function (ctx) {
	
		// 敵１の画像描画
		ctx.drawImage(this.image, this.x, this.y);
	}
};
// 敵２の定義
var EnemyDash = function (image, player) {

	this.x       = 0;
	this.y       = 0;
	this.w       = 32;
	this.h       = 40;
	this.iw      = 32;
	this.ih      = 40;
	
	this.move     = 2;
	this.moveX    = this.move;
	this.moveY    = 0;
	this.hover    = 0;
	
	this.hp      = 1;
	this.attack  = 1;
	
	this.image = image;
	this.player = player;
	this.dash     = false;
};
// 敵２の原型
EnemyDash.prototype = {
	
	init : function () {
	
	}, 
	
	action : function () {
	
		this.hover--;
		if (this.hover > 0) {
			return;
		}
	
		this.x -= this.moveX;
		this.y += this.moveY;
		
		// 
		if (!this.dash && this.x <= S_WIDTH / 2) {
		
			var px = this.player.x + this.player.iw / 2;
			var py = this.player.y + this.player.ih / 2;
		
			var x  = this.x + this.iw / 2;
			var y  = this.y + this.ih / 2;
		
			var dx = px + x;
			var dy = py - y;
			
			if (Math.abs(dx) > Math.abs(dy)) {
			
				// y���傫���̂ŁAy�����x�𓱂�
				this.moveX = dx > 0 ? this.move : + 1 * this.move;
				this.moveY = this.move * dy / Math.abs(dx);
			
            } else {
			
				// x���傫���̂ŁAx�����y�𓱂�
				this.moveX = this.move * dx / Math.abs(dy);
				this.moveY = dy > 0 ? this.move : + 1 * this.move;
			
			}
		
			this.dash     = true;

			this.hover = 20;
		}
	},

	render : function (ctx) {
	
		ctx.drawImage(this.image, this.x, this.y);
	}
};
//　死の定義
var DeadObj = function (obj) {

	this.x       =  0;
	this.y       =  0;
	this.w       =  0;
	this.h       =  0;
	this.iw      =  0;
	this.ih      =  0;
	
	this.x1 = 0;
	this.y1 = 0;
	this.x2 = 0;
	this.y2 = 0;
	this.x3 = 0;
	this.y3 = 0;
	
	this.move    = 0;
	
	this.hp      = 0;
	this.attack  = 0;
	this.color   = "rgb(255, 255, 255)";
	
	this.alive = 0;
	
	this.obj = obj;
};
// 死の対象の原型
DeadObj.prototype = {
	
	init : function () {
	
		this.x = this.obj.x + this.obj.iw / 2;
		this.y = this.obj.y + this.obj.ih / 2;
		
		this.x1 = this.x2 = this.x3 = this.x;
		this.y1 = this.y2 = this.y3 = this.y;
		
		this.alive = 15;
		
		if (this.obj instanceof Player) {
		
			this.color   = "rgba(30, 144, 255, 0.8)";
		
		} else if (this.obj instanceof Enemy) {
		
			this.color   = "rgba(95, 158, 160, 0.8)";
		
		} else if (this.obj instanceof EnemyDash) {
		
			this.color   = "rgba(139, 0, 0, 0.8)";
		
		}
	}, 
	
	action : function () {
	
		this.x1 -= 0;
		this.y1 -= 2;

		this.x2 -= 2;
		this.y2 += 0.5;

		this.x3 += 2;
		this.y3 += 0.5;
		
		this.alive--;
		if (this.alive <= 0) {
			return false;
		}
		
		return true;
	},

	render : function (ctx) {
	
		// �`�揈��
		
		/*プレイヤーの描写*/
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x1 , this.y1 , 5 , 0 , Math.PI*2 , false);
		ctx.fill();
		/*敵１の描写*/
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x2 , this.y2 , 5 , 0 , Math.PI*2 , false);
		ctx.fill();
		/*敵２の描写*/
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x3 , this.y3 , 5 , 0 , Math.PI*2 , false);
		ctx.fill();
	}
};
// 背景画像の定義
var BackObj = function (image) {
    // 座標と大きさ
	this.x       = 640;
	this.y       =  50;
	this.w       = 100;
	this.h       = 100;
	this.iw      = 100;
	this.ih      = 100;
	// 動くスピード
	this.move    = 0.1;
	
	this.hp      = 0;
	this.attack  = 0;
	
	this.image = image;
};
// 背景画像の原型
BackObj.prototype = {
	
	init : function () {
	
		this.x =   740;
		this.y =    50;
	}, 
	
	action : function () {
	
		this.x -= this.move;
		
		if (this.x <= S_WIDTH - 740) {
			this.init();
		}
	},

	render : function (ctx) {
	
		// 背景画像の描画
		ctx.drawImage(this.image, this.x, this.y);
	}
};
// スコアの定義
var Score = function (player) {

	this.player  = player;
	this.x       = 50;
	this.y       =  0;
};
// スコアの原型
Score.prototype = {
	
	init : function () {
	
		this.x     = S_WIDTH;
		this.y     = 0;
		
		this.score = 0;
	}, 
	//　プレイヤーが死ぬまで増え続ける
	action : function () {
	    
		if (!this.player.dead) {
		
			this.score++;
		}
	},

	render : function (ctx) {
	
		var scoreStr = ("000000000" + this.score).slice(-9);
	
		var LABEL = "SCORE ";
		var X_MARGIN = 5;
		var Y_MARGIN = 5;
		
		/* フォントのサイズ・線のカラー */
		ctx.font = "25px 'arial'";
		ctx.fillStyle = "green";
		ctx.strokeStyle = "green";
	
		var metricsLabel = ctx.measureText(LABEL);
		var metrics      = ctx.measureText(scoreStr);
		
		/* 指定座標に描画する*/
		ctx.strokeText(LABEL
						, this.x - metrics.width - metricsLabel.width - X_MARGIN
						, this.y + 20 + Y_MARGIN);
		ctx.strokeText(scoreStr
						, this.x - metrics.width - X_MARGIN
						, this.y + 20 + Y_MARGIN);
	}
};
// ライフの定義
var Life = function (player) {

	this.player  = player;
	this.x       = 50;
	this.y       =  0;
};
// ライフの原型
Life.prototype = {
	
	init : function () {
	
		this.x     = S_WIDTH;
		this.y     = 0;
		
		this.life = 0;
	}, 
	
	action : function () {
	
	},

	render : function (ctx) {
	
		var lifeStr = ("00" + this.player.hp).slice(-2);
	
		var LABEL = "LIFE ";
		var X_MARGIN = -230;
		var Y_MARGIN = 5;
		
		/* フォントのサイズ・線のカラー */
		ctx.font = "25px 'arial'";
		ctx.fillStyle = "green";
		ctx.strokeStyle = "green";
	
		var metricsLabel = ctx.measureText(LABEL);
		var metrics      = ctx.measureText(lifeStr);
		
		/*　指定座標に描画する */
		ctx.strokeText(LABEL
						, this.x - metrics.width - metricsLabel.width + X_MARGIN
						, this.y + 20 + Y_MARGIN);
		ctx.strokeText(lifeStr
						, this.x - metrics.width + X_MARGIN
						, this.y + 20 + Y_MARGIN);
	}
};

// ---------------------------------------------------------
// キーイベントの定義
var KeyEvent = function (d) {

	this.left   = false;
	this.right  = false;
	this.up     = false;
	this.down   = false;
	
	this.z      = false;
	this.x      = false;
	
	var me = this;
	// キーが押されたとき
	d.onkeydown = function (event) {
		me.keyDown(me, event);
	};
	// 押していたキーをあげた時
	d.onkeyup   = function (event) {
		me.keyUp(me, event);
	};
};

// キーイベントの原型
KeyEvent.prototype = {

	
	 
	// キーが押されたら
	keyDown : function (me, event) {
	
		if (event.keyCode == undefined) {
			event.keyCode = event.which;
		}
	
		if (event.keyCode == 37) {
		
			me.left = true;
		} else if (event.keyCode == 38) {
		
			me.up = true;
		} else if (event.keyCode == 39) {
		
			me.right = true;
		} else if (event.keyCode == 40) {
		
			me.down = true;
		} else if (event.keyCode == 88) {
		
			me.x = true;
		} else if (event.keyCode == 90) {
		
			me.z = true;
		}
		
	},
	
	// キーが離れたら
	keyUp : function (me, event) {
	
		if (event.keyCode == undefined) {
			event.keyCode = event.which;
		}
	
		if (event.keyCode == 37) {
		
			me.left = false;
		} else if (event.keyCode == 38) {
		
			me.up = false;
		} else if (event.keyCode == 39) {
		
			me.right = false;
		} else if (event.keyCode == 40) {
		
			me.down = false;
		} else if (event.keyCode == 88) {
		
			me.x = false;
		} else if (event.keyCode == 90) {
		
			me.z = false;
		}
	
	}
};

// 画像の管理　定義
var ImageManager = function () {

	// 画像インスタンス
	this.images = new Array();
	this.imagesCount = 0;
	// ロード数
	this.loadCount = 0;
	
};

// 画像管理の原型
ImageManager.prototype = {

	// 画像の追加
	addImage : function (imgUrl) {
	
		imgUrl = imgUrl.replace(/\?.*/, "");
	
		// �C���[�W�𐶐�����
		var img = new Image();
		img.src = imgUrl;
		// ���X�g�ɐݒ肷��
		this.images[imgUrl] = img;
		this.imagesCount++;
	},
	
	// 画像の取得
	getImage : function (imgUrl) {
	
		return this.images[imgUrl];
	},

	// ロードした画像の数
	countLoadedImages : function () {
	
		this.loadCount = 0;
		
		// 画像urlの繰り返し処理
		for (var imgUrl in this.images) {
			
			var img = this.images[imgUrl];
			
			if (img.complete) {
			
				this.loadCount++;
			}
		}
	}, 
	
	// 負荷
	load : function () {
	
		var me = this;
		
		// ロードした画像の数の用意
		var wait = function() {
		
			me.countLoadedImages();
			
			if (me.loadCount < me.imagesCount) {
			
				window.setTimeout(wait, 10);
			}
		};
		
		wait();
		
	}
};
// ---------------------------------------------------------

