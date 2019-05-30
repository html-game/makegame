var S_WIDTH  = 640;
var S_HEIGHT = 480;

var SceneTitle = function (imageManager) {

	this.imageManager = imageManager;
	this.imageTitle   = this.imageManager.getImage("img/title.png");
};

SceneTitle.prototype = {

	init : function () {
	
	},

	action : function (keyEvent) {

		// �X�^�[�g
		if (keyEvent.z) {
		
			// ���C���V�[����ԋp����
			return new SceneMain(this.imageManager);
		}
		
		return null;
	}, 

	render : function (ctx) {
		
		// �w�i���N���A����
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect(
					  0
					, 0
					, S_WIDTH
					, S_HEIGHT);

		// �^�C�g����`�悷��
		ctx.drawImage(this.imageTitle, S_WIDTH / 2 - 299 / 2, 150);
		
		/* �t�H���g�X�^�C�����` */
		ctx.font = "35px '�l�r �S�V�b�N'";
		ctx.strokeStyle = "green";
	
		var MESSAGE = "Press z key to Start";
		
		var metricsLabel = ctx.measureText(MESSAGE);
		
		/* �F��strokText */
		ctx.strokeText(MESSAGE
						, S_WIDTH / 2 - metricsLabel.width / 2
						, S_HEIGHT / 2);
	},
	
};

var SceneMain = function (imageManager) {

	this.imageManager = imageManager;

	this.player        = new Player(imageManager.getImage("img/player.png"));
	this.playerBullets = new Array();
	this.objects       = new Array();
	this.deadObjects   = new Array();
	this.backObjects   = new Array();
	
	this.score         = new Score(this.player);
	this.life          = new Life(this.player);
	
	this.diffcult = 100;
	
	this.gameover = false;
	this.gameoverTime = 300;
};

SceneMain.prototype = {

	init : function () {
	
		this.score.init();
		this.life.init();

		// �v���C���[�̏����ʒu��ݒ肷��
		this.player.x = S_WIDTH  / 2 - this.player.iw / 2;
		this.player.y = S_HEIGHT     - this.player.ih - 30;
		
		// �o�b�N�I�u�W�F�N�g��ǉ�����
		var b = new BackObj(this.imageManager.getImage("img/back-obj.png"));
		b.init();
		this.backObjects.push(b);

		this.gameover = false;
		this.gameoverTime = 300;

	},

	action : function (keyEvent) {

		this.gameoverTime--;
		if (this.gameoverTime < 0) {
			this.gameoverTime = 0;
		}
		
		if (this.gameover && this.gameoverTime <= 0) {
			return new SceneTitle(this.imageManager);
			
		}

		var rand = Math.floor( Math.random() * 100 );
		
		// N�̔{���̏ꍇ
		if (rand % this.diffcult == 0) {

			var randXOffset = Math.floor( Math.random() * 570 ) + 10;
			
			var rand = Math.floor( Math.random() * 100 );
			
			// 7�̔{���̏ꍇ
			if (rand % 7 == 0) {
			
				var o = new EnemyDash(this.imageManager.getImage("img/enemy-dash.png"), this.player);
				o.init();
				o.x   = randXOffset;
				o.y   = -70;
				
				this.objects.push(o);
			
			// ����ȊO
			} else {
			
			
				var o = new Enemy(this.imageManager.getImage("img/enemy.png"));
				o.init();
				o.x = randXOffset;
				o.y = -70;
				
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
		// �v���C���[�Ɖ�ʗ̈�̓����蔻��
		this.adjustInnerScreen(this.player);

		if (!this.player.star) {
		
			// �v���C���[�Ƃ��̑��I�u�W�F�N�g�Ƃ̓����蔻��
			for (i = 0; i < this.objects.length; i++) {
				
				// HIT���Ă���
				if (
					this.isHit(this.objects[i], this.player)      ||
					this.isHit(this.player    , this.objects[i]) )  {

					// �v���C���[�ƁA�q�b�g�����I�u�W�F�N�g�̑ϋv�͂�������
					this.player.hp     -= this.objects[i].attack;
					this.objects[i].hp -= this.player.attack;
					
					this.player.star = true;
					this.player.starTime = 300;
					
				}

			}
		}

		// �v���C���[�o���b�g�Ƃ��̑��I�u�W�F�N�g�Ƃ̓����蔻��
		for (i = 0; i < this.objects.length; i++) {
			
			for (j = 0; j < this.playerBullets.length; j++) {
			
				// HIT���Ă���
				if (
					this.isHit(this.objects[i]      , this.playerBullets[j] )      ||
					this.isHit(this.playerBullets[j], this.objects[i])      )  {

					// �v���C���[�ƁA�q�b�g�����I�u�W�F�N�g�̑ϋv�͂�������
					this.playerBullets[j].hp  -= this.objects[i].attack;
					this.objects[i].hp        -= this.playerBullets[j].attack;
					
				}

			}
			
		}
		
		// �Q�[���I�[�o�[
		if (!this.player.dead && this.player.hp <= 0) {
			
			// �Q�[���I�[�o�[
			this.player.dead = true;
			// �f�b�h�I�u�W�F�N�g�𐶐�����
			this.generateDeadObj(this.player);
			
			this.gameover = true;
			this.gameoverTime = 300;
		}
		
		for (i = 0; i < this.objects.length; i++) {
			
			// �I�u�W�F�N�g�̑ϋv�͂��Ȃ��Ȃ����ꍇ�A��������
			if (this.objects[i].hp <= 0) {
				
				// �f�b�h�I�u�W�F�N�g�𐶐�����
				this.generateDeadObj(this.objects[i]);
			
				this.objects.splice(i, 1);
				i--;
				
				break;
			}
			// �I�u�W�F�N�g���̈�O�ɓ��B�����ꍇ�A��������
			else if (this.isOutOfRange(this.objects[i])) {

				// �f�b�h�I�u�W�F�N�g�𐶐�����
				this.generateDeadObj(this.objects[i]);
			
				this.objects.splice(i, 1);
				i--;
				continue;
			}
		}
		
		for (i = 0; i < this.playerBullets.length; i++) {
			
			// �I�u�W�F�N�g�̑ϋv�͂��Ȃ��Ȃ����ꍇ�A��������
			if (this.playerBullets[i].hp <= 0) {
			
				this.playerBullets.splice(i, 1);
				i--;
				continue;
			}
			// �o���b�g���̈�O�ɓ��B�����ꍇ�A��������
			else if (this.isOutOfRange(this.playerBullets[i])) {
				this.playerBullets.splice(i, 1);
				i--;
				continue;
			}
		}
		

		// ------------------------------------------
		// ��������肷��
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
		
		// �w�i���N���A����
		ctx.fillStyle = 'rgb(0, 0, 0)';
		ctx.fillRect(
					  0
					, 0
					, S_WIDTH
					, S_HEIGHT);

		// ------------------------------------------
		// �`�悷��
		// ------------------------------------------
		this.score.render(ctx);
		this.life.render(ctx);
		
		for (i = 0; i < this.backObjects.length; i++) {
			this.backObjects[i].render(ctx);
		}
		
		for (i = 0; i < this.objects.length; i++) {
			this.objects[i].render(ctx);
		}

		this.player.render(ctx);
		
		for (i = 0; i < this.playerBullets.length; i++) {
			this.playerBullets[i].render(ctx);
		}

		for (i = 0; i < this.deadObjects.length; i++) {
			this.deadObjects[i].render(ctx);
		}
		
	},
	
	generateDeadObj : function (obj) {
	
		var d = new DeadObj(obj);
		d.init();
		
		this.deadObjects.push(d);
	}, 
	
	isHit : function (obj1, obj2) {
		
		var obj1L = obj1.x + (obj1.iw / 2) - (obj1.w / 2);
		var obj1R = obj1.x + (obj1.iw / 2) + (obj1.w / 2);
		var obj1T = obj1.y + (obj1.ih / 2) - (obj1.h / 2);
		var obj1B = obj1.y + (obj1.ih / 2) + (obj1.h / 2);
		
		var obj2L = obj2.x + (obj2.iw / 2) - (obj2.w / 2);
		var obj2R = obj2.x + (obj2.iw / 2) + (obj2.w / 2);
		var obj2T = obj2.y + (obj2.ih / 2) - (obj2.h / 2);
		var obj2B = obj2.y + (obj2.ih / 2) + (obj2.h / 2);
		
		// 4�ӂ̓����蔻��`�F�b�N
		
		// ����
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

	
	isOutOfRange : function (obj) {
	
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
	
	adjustInnerScreen : function (obj) {
	
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

var PlayerBullet = function (image) {

	this.x       =  0;
	this.y       =  0;
	this.w       =  5;
	this.h       = 10;
	this.iw      =  5;
	this.ih      = 10;
	
	this.move    = 4;
	
	this.hp      =  1;
	this.attack  =  2;
	
	this.image = image;
	
	this.alpha  = 1.0;
	this.alphaA = 0.01;
};

PlayerBullet.prototype = {

	init : function () {
	
	}, 
	
	action : function (keyEvent) {
	
		this.y -= this.move;
	},

	render : function (ctx) {
	
		if (this.alpha >= 1.0) {
			this.alphaA = -0.01;
		} else if (this.alpha <= 0.5) {
			this.alphaA =  0.01;
		}
		
		this.alpha += this.alphaA;
	
		// �`�揈��
		ctx.fillStyle = 'rgba(255, 255, 255, ' + this.alpha + ')';
		ctx.fillRect(
					  this.x
					, this.y
					, this.w
					, this.h);
	}
};

var Player = function (image) {

	this.x       = 0;
	this.y       = 0;
	this.w       = 21;
	this.h       = 30;
	this.iw      = 45;
	this.ih      = 52;
	
	this.move    = 3;
	
	this.hp      = 3;
	this.attack  = 1;
	
	this.image = image;
	
	this.shootDelay = 0;
	
	this.dead      = false;
	this.star      = false; // ���G�t���O
	this.starTime  = 30; // ���G����
	
	this.left1Press   = false;
	this.left1Up      = false;
	this.left2Press   = false;
	
	this.leftLatestPressTime = 0;
	this.leftLatestUpTime = 0;
	
	this.leftDash     = false;
	this.leftDashTime = 0;
};

Player.prototype = {
	
	init : function () {
	
	}, 
	
	action : function (keyEvent) {
	
		if (this.dead) {
			
			return;
		}
		
		if (keyEvent.x)    {
			this.move = 1.5;
		} else {
			this.move = 3;
		}
	
		// �L�[���쏈���̓K�p
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

//		// ------------------------------------------------------
//		// �L�[��f������x��������
//		if (!this.leftDash) {
//		
//			// 1��ڂ̃L�[��������
//			if (      keyEvent.left && !this.left1Press) {
//				this.left1Press = true;
//			}
//			// 1��ڂ̃L�[��������
//			else if (!keyEvent.left &&  this.left1Press && !this.left1Up                     && this.leftLatestPressTime <= 20) {
//				this.left1Up = true;
//			}
//			// 2��ڂ̃L�[��������
//			else if (keyEvent.left  &&  this.left1Press &&  this.left1Up && this.leftLatestUpTime    <= 20) {
//				// ��x�������m
//				this.move = 6;
//				this.leftDash     = true;
//				this.leftDashTime = 10;
//				
//				// ��u���G����ɂ���
//				this.star     = true;
//				this.starTime = 10;
//			}
//			
//			
//			if (this.left1Press && !this.left1Up) {
//				this.leftLatestPressTime++;
//			} else {
//				this.leftLatestPressTime = 0;
//			}
//			
//			if (this.left1Press &&  this.left1Up) {
//				this.leftLatestUpTime++;
//			} else {
//				this.leftLatestUpTime = 0;
//			}
//
//			// ���ԓ��ɃL�[�������Ȃ��Ɗe�t�B�[���h�𖳌��ɂ���
//			if (
//				(this.left1Press && this.leftLatestPressTime > 20) || 
//				(this.left1Press && this.left1Up && this.leftLatestUpTime > 20)
//			) {
//				this.left1Press = false;
//				this.left1Up = false;
//				this.left2Press = false;
//				this.left2Up = false;
//				this.leftLatestPressTime = 0;
//				this.leftLatestUpTime = 0;
//			}
//			
//		}
//
//		this.leftDashTime--;
//		if (this.leftDashTime < 0) {
//			this.leftDashTime = 0;
//		}
//		
//		if (this.leftDash && this.leftDashTime <= 0) {
//			this.leftDashTime = 0;
//			this.leftDash     = false;
//			this.move = 3;
//			
//			this.left1Press = false;
//			this.left1Up = false;
//			this.left2Press = false;
//			this.left2Up = false;
//			this.leftLatestPressTime = 0;
//			this.leftLatestUpTime = 0;
//		}

		// ------------------------------------------------------

		var s = null;
		
		// �V���b�g
		if (keyEvent.z && this.shootDelay <= 0) {
			s = new PlayerBullet();
			s.init();
			s.x = this.x + (this.iw / 2) - (s.w / 2);
			s.y = this.y;
			
			this.shootDelay = 10;
		}

		// �A�����ăV���b�g�ł��Ȃ��悤�ɂ���
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
			
				// �_�ł�����
			} else {
				// �`�揈��
				ctx.drawImage(this.image, this.x, this.y);
			}
		} else {
	
			// �`�揈��
			ctx.drawImage(this.image, this.x, this.y);
		
		}
	}

};

var Enemy = function (image) {

	this.x       = 0;
	this.y       = 0;
	this.w       = 38;
	this.h       = 42;
	this.iw      = 38;
	this.ih      = 42;
	
	this.move    = 2;
	
	this.hp      = 1;
	this.attack  = 1;
	
	this.image = image;
};

Enemy.prototype = {
	
	init : function () {
	
	}, 
	
	action : function () {
	
		this.y += this.move;
	},

	render : function (ctx) {
	
		// �`�揈��
		ctx.drawImage(this.image, this.x, this.y);
	}
};

var EnemyDash = function (image, player) {

	this.x       = 0;
	this.y       = 0;
	this.w       = 32;
	this.h       = 40;
	this.iw      = 32;
	this.ih      = 40;
	
	this.move     = 3;
	this.moveX    = 0;
	this.moveY    = this.move;
	this.hover    = 0;
	
	this.hp      = 1;
	this.attack  = 1;
	
	this.image = image;
	this.player = player;
	this.dash     = false;
};

EnemyDash.prototype = {
	
	init : function () {
	
	}, 
	
	action : function () {
	
		this.hover--;
		if (this.hover > 0) {
			return;
		}
	
		this.x += this.moveX;
		this.y += this.moveY;
		
		// ��ʂ�3����1������𒴂���ƁE�E�E
		if (!this.dash && this.y >= S_HEIGHT / 3) {
		
			var px = this.player.x + this.player.iw / 2;
			var py = this.player.y + this.player.ih / 2;
		
			var x  = this.x + this.iw / 2;
			var y  = this.y + this.ih / 2;
		
			var dx = px - x;
			var dy = py - y;
			
			if (Math.abs(dy) > Math.abs(dx)) {
			
				// y���傫���̂ŁAy�����x�𓱂�
				this.moveX = this.move * dx / Math.abs(dy);
				this.moveY = dy > 0 ? this.move : - 1 * this.move;
			
			} else {
			
				// x���傫���̂ŁAx�����y�𓱂�
				this.moveX = dx > 0 ? this.move : - 1 * this.move;
				this.moveY = this.move * dy / Math.abs(dx);
			
			}
		
			this.dash     = true;

			this.hover = 20;
		}
	},

	render : function (ctx) {
	
		ctx.drawImage(this.image, this.x, this.y);
	}
};

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
		
		/* �~ #1 */
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x1, this.y1,  5, 0, Math.PI*2, false);
		ctx.fill();
		/* �~ #2 */
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x2, this.y2,  5, 0, Math.PI*2, false);
		ctx.fill();
		/* �~ #3 */
		ctx.beginPath();
		ctx.fillStyle = this.color;
		ctx.arc(this.x3, this.y3,  5, 0, Math.PI*2, false);
		ctx.fill();
	}
};

var BackObj = function (image) {

	this.x       = 50;
	this.y       =  0;
	this.w       = 100;
	this.h       = 100;
	this.iw      = 100;
	this.ih      = 100;
	
	this.move    = 0.05;
	
	this.hp      = 0;
	this.attack  = 0;
	
	this.image = image;
};

BackObj.prototype = {
	
	init : function () {
	
		this.x =    50;
		this.y = - 100;
	}, 
	
	action : function () {
	
		this.y += this.move;
		
		if (this.y >= S_HEIGHT + 50) {
			this.init();
		}
	},

	render : function (ctx) {
	
		// �`�揈��
		ctx.drawImage(this.image, this.x, this.y);
	}
};

var Score = function (player) {

	this.player  = player;
	this.x       = 50;
	this.y       =  0;
};

Score.prototype = {
	
	init : function () {
	
		this.x     = S_WIDTH;
		this.y     = 0;
		
		this.score = 0;
	}, 
	
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
		
		/* �t�H���g�X�^�C�����` */
		ctx.font = "25px '�l�r �S�V�b�N'";
		ctx.fillStyle = "green";
		ctx.strokeStyle = "green";
	
		var metricsLabel = ctx.measureText(LABEL);
		var metrics      = ctx.measureText(scoreStr);
		
		/* �F��strokText */
		ctx.strokeText(LABEL
						, this.x - metrics.width - metricsLabel.width - X_MARGIN
						, this.y + 20 + Y_MARGIN);
		ctx.strokeText(scoreStr
						, this.x - metrics.width - X_MARGIN
						, this.y + 20 + Y_MARGIN);
	}
};

var Life = function (player) {

	this.player  = player;
	this.x       = 50;
	this.y       =  0;
};

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
		
		/* �t�H���g�X�^�C�����` */
		ctx.font = "25px '�l�r �S�V�b�N'";
		ctx.fillStyle = "green";
		ctx.strokeStyle = "green";
	
		var metricsLabel = ctx.measureText(LABEL);
		var metrics      = ctx.measureText(lifeStr);
		
		/* �F��strokText */
		ctx.strokeText(LABEL
						, this.x - metrics.width - metricsLabel.width + X_MARGIN
						, this.y + 20 + Y_MARGIN);
		ctx.strokeText(lifeStr
						, this.x - metrics.width + X_MARGIN
						, this.y + 20 + Y_MARGIN);
	}
};

// ---------------------------------------------------------
/**
 * KeyEvent�R���X�g���N�^�B
 */
var KeyEvent = function (d) {

	this.left   = false;
	this.right  = false;
	this.up     = false;
	this.down   = false;
	
	this.z      = false;
	this.x      = false;
	
	var me = this;
	
	d.onkeydown = function (event) {
		me.keyDown(me, event);
	};
	
	d.onkeyup   = function (event) {
		me.keyUp(me, event);
	};
};

/**
 * KeyEvent�����o��`
 */
KeyEvent.prototype = {

	/**
	 * �C���[�W��ǉ�����B
	 */
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
	
	/**
	 * �C���[�W��ǉ�����B
	 */
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

/**
 * ImageManager�R���X�g���N�^�B
 */
var ImageManager = function () {

	// �C���[�W�i�[�p���X�g
	this.images = new Array();
	this.imagesCount = 0;
	// �C���[�W���[�h�����J�E���g
	this.loadCount = 0;
	
};

/**
 * ImageManager�����o��`
 */
ImageManager.prototype = {

	/**
	 * �C���[�W��ǉ�����B
	 */
	addImage : function (imgUrl) {
	
		imgUrl = imgUrl.replace(/\?.*/, "");
	
		// �C���[�W�𐶐�����
		var img = new Image();
		img.src = imgUrl;
		// ���X�g�ɐݒ肷��
		this.images[imgUrl] = img;
		this.imagesCount++;
	},
	
	/**
	 * �C���[�W���擾����B
	 */
	getImage : function (imgUrl) {
	
		return this.images[imgUrl];
	},

	/**
	 * ���[�h���ꂽ�C���[�W�̌������J�E���g����B
	 */
	countLoadedImages : function () {
	
		this.loadCount = 0;
		
		// �C���[�W���������[�h����
		for (var imgUrl in this.images) {
			
			var img = this.images[imgUrl];
			
			if (img.complete) {
			
				this.loadCount++;
			}
		}
	}, 
	
	/**
	 * �C���[�W�̃��[�h����B
	 */
	load : function () {
	
		var me = this;
		
		// �C���[�W�̃��[�h����������܂őҋ@����֐�
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

