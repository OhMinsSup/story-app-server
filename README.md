<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Story App Server

🙏🏻 NFT Market App Generate (Nextjs)


## ⚡ Features

해당 본문은 앞으로 지원하는 기능 추가 및 계획된 기능들을 보여줍니다. 체크박스를 체크하면 해당 기능은 추가된 기능임을 의미합니다. 그렇지 않으면 아직 계획 및 구현 단계인 상태입니다. 구체적인 내용은 항목 설명을 참조하십시오.


- [ ] `API 서버 분리해서 생성하기`
    - 서버 구성은 nest / prisma를 사용 할 계획 입니다.

- [ ] `NFT Token 생성`
    - openzeppelin을 이용해서 구현
  
- [ ] `Klaytn 연동`

## 📝 TODO

- [x] `회원가입 API`

- [x] `로그인 API`

- [x] `인증`

- [x] `쿠키 및 header로 인증`

- [x] `내 정보 가져오기`

- [x] `파일 업로드 API`

- [x] `Story 등록 API`

- [x] `Story 수정 API`

- [x] `Story 상세 API`

- [x] `Story 리스트 API`

- [ ] `Story 삭제 API`

- [ ] `거래 히스토리`

- [ ] `스마트 컨트랙트 연동`

- [ ] `minting시 tokenId story schema와 연동`

- [ ] `minting과 관련된 액션`


## 🐳 Issue

1. NFT 등록을 서버에서 등록이 되는 형태로 구현 할 것인가? 아니면 클라이언트에서 할 것 인가? 아마 서버에서 할 것 같은데 임시로 클라이언트에 구현을 해야하나

2. NFT를 서버에 등록한다면 어떤식으로 저장을 할 것 인가??


## 💩 Bug


## Installation

```bash
$ npm install

$ yarn add
```

## 🚀 Running the app

```bash
# development
$ npm run start
$ yarn start

# watch mode
$ npm run start:dev
$ yarn start:dev

# production mode
$ npm run start:prod
$ yarn start:prod
```

## Prisma

```bash
$ yarn add prisma --dev

$ yarn prisma init

$ yarn prisma db pull

$ yarn prisma generate

$ yarn prisma migrate dev --name [...name]

```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
