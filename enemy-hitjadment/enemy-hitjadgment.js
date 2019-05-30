var S_WIDTH  = 640;
var S_HEIGHT = 480;


var SceneMain = function (imageManager) {

	this.imageManager = imageManager;

	this.score         = new Score();
	
	this.player        = new Player(imageManager.getImage("img/player.png"));
	this.playerBullets = new Array();
	this.objects       = new Array();
	this.backObjects   = new Array();
	
	this.diffcult = 100;
};

SceneMain.prototype = {

	init : function () {
	
		this.score.init();

		// �v���C���[�̏����ʒu��ݒ肷��
		this.player.x = S_WIDTH  / 2 - this.player.iw / 2;
		this.player.y = S_HEIGHT     - this.player.ih - 30;
		
		// �o�b�N�I�u�W�F�N�g��ǉ�����
		var b = new BackObj(this.imageManager.getImage("img/back-obj.png"));
		b.init();
		this.backObjects.push(b);
	},

	action : function (keyEvent) {

		var rand = Math.floor( Math.random() * 100 );
		
		// N�̔{���̏ꍇ
		if (rand % this.diffcult == 0) {
		
			var randXOffset = Math.floor( Math.random() * 640 );
			
			var o = new Enemy(this.imageManager.getImage("img/enemy.png"));
			o.init();
			o.x = randXOffset;
			o.y = -70;
			
			this.objects.push(o);
			
			this.diffcult--;
			
			if (this.diffcult <= 10) {
				this.diffcult = 10;
			}
		}

		// ------------------------------------------
		// ��������肷��
		// ------------------------------------------
		this.score.action();
		
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
		
		// ------------------------------------------
		// �����蔻��
		// ------------------------------------------
		// �v���C���[�Ɖ�ʗ̈�̓����蔻��
		this.adjustInnerScreen(this.player);

		// �v���C���[�Ƃ��̑��I�u�W�F�N�g�Ƃ̓����蔻��
		for (i = 0; i < this.objects.length; i++) {
			
			// HIT���Ă���
			if (
				this.isHit(this.objects[i], this.player)      ||
				this.isHit(this.player    , this.objects[i]) )  {

				// �v���C���[�ƁA�q�b�g�����I�u�W�F�N�g�̑ϋv�͂�������
				this.player.hp     -= this.objects[i].attack;
				this.objects[i].hp -= this.player.attack;
				
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
		if (this.player.hp <= 0) {
			
		}
		
		for (i = 0; i < this.objects.length; i++) {
			
			// �I�u�W�F�N�g�̑ϋv�͂��Ȃ��Ȃ����ꍇ�A��������
			if (this.objects[i].hp <= 0) {
			
				this.objects.splice(i, 1);
				i--;
				break;
			}
			// �I�u�W�F�N�g���̈�O�ɓ��B�����ꍇ�A��������
			else if (this.isOutOfRange(this.objects[i])) {
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

	},
	
	isHit : function (obj1, obj2) {
		
		// 4�ӂ̓����蔻��`�F�b�N
		
		// ����
		if (obj1.x <= obj2.x && obj2.x <= obj1.x + obj1.w &&
			obj1.y <= obj2.y && obj2.y <= obj1.y + obj1.h) {
			
			return true;
		}
		
		// �E��
		if (obj1.x <= obj2.x + obj2.w && obj2.x + obj2.w <= obj1.x + obj1.w &&
			obj1.y <= obj2.y + obj2.h && obj2.y + obj2.h <= obj1.y + obj1.h) {
			
			return true;
		}
		
		// ����
		if (obj1.x <= obj2.x          && obj2.x          <= obj1.x + obj1.w &&
			obj1.y <= obj2.y + obj2.h && obj2.y + obj2.h <= obj1.y + obj1.h) {
			
			return true;
		}
		
		// �E��
		if (obj1.x <= obj2.x + obj2.w && obj2.x + obj2.w <= obj1.x + obj1.w &&
			obj1.y <= obj2.y          && obj2.y          <= obj1.y + obj1.h) {
			
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
		
		if (obj.x + obj.w >= S_WIDTH + X_MARGIN) {
		
			return true;
			
		}
		
		if (obj.y <= -1 * Y_MARGIN) {
		
			return true;
			
		}
		
		if (obj.y + obj.h >= S_HEIGHT + Y_MARGIN) {
		
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

	this.x       = 0;
	this.y       = 0;
	this.w       = 5;
	this.h       = 10;
	this.iw      = 60;
	this.ih      = 60;
	
	this.move    = 4;
	
	this.hp      =  1;
	this.attack  =  1;
	
	this.image = image;
	
};

PlayerBullet.prototype = {

	init : function () {
	
	}, 
	
	action : function (keyEvent) {
	
		this.y -= this.move;
	},

	render : function (ctx) {
	
		// �`�揈��
		ctx.fillStyle = 'rgb(255, 255, 255)';
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
	this.w       = 36;
	this.h       = 36;
	this.iw      = 60;
	this.ih      = 60;
	
	this.move    = 3;
	
	this.hp      = 3;
	this.attack  = 1;
	
	this.image = image;
	
	this.shootDelay = 0;
};

Player.prototype = {
	
	init : function () {
	
	}, 
	
	action : function (keyEvent) {
	
		// �L�[���쏈���̓K�p
		if (keyEvent.up)    this.y -= this.move;
		if (keyEvent.down)  this.y += this.move;
		if (keyEvent.left)  this.x -= this.move;
		if (keyEvent.right) this.x += this.move;

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

		return s;
	},
	
	render : function (ctx) {
	
		// �`�揈��
		ctx.drawImage(this.image, this.x, this.y);
	}

};

var Enemy = function (image) {

	this.x       = 0;
	this.y       = 0;
	this.w       = 38;
	this.h       = 38;
	this.iw      = 60;
	this.ih      = 60;
	
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

var Score = function () {

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
		this.score++;
	},

	render : function (ctx) {
	
		var scoreStr = ("000000000" + this.score).slice(-9);
	
		var LABEL = "score";
		var X_MARGIN = 5;
		var Y_MARGIN = 0;
		
		/* �t�H���g�X�^�C�����` */
		ctx.font = "25px '�l�r �S�V�b�N'";
		ctx.fillStyle = "white";
		ctx.strokeStyle = "green";
	
		var metricsLabel = ctx.measureText(LABEL);
		var metrics      = ctx.measureText(scoreStr);
		
		/* �F��strokText */
		ctx.fillText(LABEL
						, this.x - metrics.width - X_MARGIN + (metricsLabel.width / 2)
						, this.y + 20);
		ctx.fillText(scoreStr
						, this.x - metrics.width - X_MARGIN
						, this.y + 40);
		ctx.strokeText(LABEL
						, this.x - metrics.width - X_MARGIN + (metricsLabel.width / 2)
						, this.y + 20);
		ctx.strokeText(scoreStr
						, this.x - metrics.width - X_MARGIN
						, this.y + 40);
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

